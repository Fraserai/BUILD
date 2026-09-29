"""HTTP layer: Twilio webhooks, the owner dashboard and the admin API."""

import html
import logging

from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException, Request, Response
from pydantic import BaseModel
from twilio.request_validator import RequestValidator
from twilio.twiml.messaging_response import MessagingResponse
from twilio.twiml.voice_response import VoiceResponse

from .ai import ClaudeLeadAgent, LeadAgent
from .config import Settings
from .db import Database
from .service import LeadBack
from .sms import SmsSender, TwilioSender

log = logging.getLogger(__name__)

# Ring the owner for less time than it takes their voicemail to pick up (usually ~25s),
# otherwise Twilio sees voicemail as an answered call and no text goes out.
DIAL_TIMEOUT_SECONDS = 18

MISSED_CALL_GREETING = (
    "Sorry we missed your call. We just sent you a text message so we can help you right away. Goodbye."
)


class NewBusiness(BaseModel):
    name: str
    twilio_number: str
    owner_cell: str
    services: str = ""
    service_area: str = ""
    hours: str = ""
    forward_to_owner: bool = True


def twiml(body: VoiceResponse | MessagingResponse) -> Response:
    return Response(content=str(body), media_type="application/xml")


def create_app(
    settings: Settings | None = None,
    agent: LeadAgent | None = None,
    sender: SmsSender | None = None,
) -> FastAPI:
    settings = settings or Settings.from_env()
    db = Database(settings.database_path)
    leadback = LeadBack(
        db,
        agent or ClaudeLeadAgent(),
        sender or TwilioSender(settings.twilio_account_sid, settings.twilio_auth_token),
    )
    validator = RequestValidator(settings.twilio_auth_token)
    app = FastAPI(title="LeadBack")

    async def twilio_form(request: Request) -> dict:
        form = {k: str(v) for k, v in (await request.form()).items()}
        if settings.validate_twilio_signature:
            url = settings.public_base_url + request.url.path
            if request.url.query:
                url += "?" + request.url.query
            if not validator.validate(url, form, request.headers.get("X-Twilio-Signature", "")):
                raise HTTPException(status_code=403, detail="Invalid Twilio signature")
        return form

    def business_for(form: dict) -> dict:
        business = db.business_by_number(form.get("To", ""))
        if not business:
            log.warning("No business configured for number %s", form.get("To"))
            raise HTTPException(status_code=404, detail="Unknown number")
        return business

    def require_admin(request: Request) -> None:
        if not settings.admin_token:
            raise HTTPException(status_code=503, detail="Admin API disabled: set ADMIN_TOKEN")
        if request.headers.get("Authorization") != f"Bearer {settings.admin_token}":
            raise HTTPException(status_code=401, detail="Unauthorized")

    @app.get("/health")
    def health() -> dict:
        return {"ok": True}

    @app.post("/voice/incoming")
    async def voice_incoming(background: BackgroundTasks, form: dict = Depends(twilio_form)) -> Response:
        business = business_for(form)
        resp = VoiceResponse()
        if business["forward_to_owner"]:
            dial = resp.dial(action="/voice/after-dial", timeout=DIAL_TIMEOUT_SECONDS)
            dial.number(business["owner_cell"])
        else:
            resp.say(MISSED_CALL_GREETING)
            background.add_task(leadback.handle_missed_call, business, form["From"])
        return twiml(resp)

    @app.post("/voice/after-dial")
    async def voice_after_dial(background: BackgroundTasks, form: dict = Depends(twilio_form)) -> Response:
        business = business_for(form)
        resp = VoiceResponse()
        if form.get("DialCallStatus") in ("completed", "answered"):
            resp.hangup()
        else:
            resp.say(MISSED_CALL_GREETING)
            background.add_task(leadback.handle_missed_call, business, form["From"])
        return twiml(resp)

    @app.post("/sms/incoming")
    async def sms_incoming(background: BackgroundTasks, form: dict = Depends(twilio_form)) -> Response:
        business = business_for(form)
        # Reply out-of-band so a slow model call never hits Twilio's webhook timeout.
        background.add_task(leadback.handle_inbound_sms, business, form["From"], form.get("Body", ""))
        return twiml(MessagingResponse())

    @app.post("/admin/businesses", dependencies=[Depends(require_admin)])
    def add_business(body: NewBusiness) -> dict:
        business = db.add_business(**body.model_dump())
        base = settings.public_base_url
        return {
            **business,
            "dashboard_url": f"{base}/dashboard?token={business['dashboard_token']}",
            "twilio_voice_webhook": f"{base}/voice/incoming",
            "twilio_sms_webhook": f"{base}/sms/incoming",
        }

    @app.get("/admin/businesses", dependencies=[Depends(require_admin)])
    def list_businesses() -> list[dict]:
        return db.list_businesses()

    @app.get("/dashboard")
    def dashboard(token: str) -> Response:
        business = db.business_by_token(token)
        if not business:
            raise HTTPException(status_code=404, detail="Not found")
        return Response(content=render_dashboard(business, db.leads_for_business(business["id"])), media_type="text/html")

    return app


def render_dashboard(business: dict, leads: list[dict]) -> str:
    e = html.escape
    rows = "".join(
        f"<tr class='{e(l['status'])} {e(l['urgency'])}'>"
        f"<td>{e(l['created_at'][:16].replace('T', ' '))}</td>"
        f"<td>{e(l['name'] or '-')}</td>"
        f"<td><a href='tel:{e(l['caller_phone'])}'>{e(l['caller_phone'])}</a></td>"
        f"<td>{e(l['service'] or '-')}</td>"
        f"<td>{e(l['address'] or '-')}</td>"
        f"<td>{e(l['urgency'])}</td>"
        f"<td>{e(l['status'])}</td>"
        f"<td>{e(l['summary'])}</td></tr>"
        for l in leads
    )
    qualified = sum(l["status"] == "qualified" for l in leads)
    return f"""<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(business['name'])} leads</title>
<style>
 body {{ font-family: system-ui, sans-serif; margin: 16px; color: #1a1a1a; background: #fafafa; }}
 table {{ border-collapse: collapse; width: 100%; background: #fff; font-size: 14px; }}
 th, td {{ padding: 8px; border-bottom: 1px solid #e5e5e5; text-align: left; vertical-align: top; }}
 tr.emergency td {{ background: #fdecea; }}
 tr.qualified td:nth-child(7) {{ color: #137333; font-weight: 600; }}
 .wrap {{ overflow-x: auto; }}
</style></head><body>
<h1>{e(business['name'])}</h1>
<p>{len(leads)} leads captured from missed calls · {qualified} ready to quote</p>
<div class="wrap"><table>
<tr><th>When (UTC)</th><th>Name</th><th>Phone</th><th>Job</th><th>Where</th><th>Urgency</th><th>Status</th><th>Summary</th></tr>
{rows or "<tr><td colspan='8'>No leads yet.</td></tr>"}
</table></div></body></html>"""


def main() -> None:
    import uvicorn

    logging.basicConfig(level=logging.INFO)
    uvicorn.run(create_app(), host="0.0.0.0", port=8000)


if __name__ == "__main__":
    main()
