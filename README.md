# LeadBack

**Missed call → instant text → AI collects the job details → the owner gets the lead.**

LeadBack is a small multi-customer SaaS for local home-service businesses. When a customer calls and nobody picks up,
LeadBack texts them back within seconds. An AI assistant (Claude) then collects their name, the job, the address and
how urgent it is, and sends the owner a ready-to-quote lead summary.

The business plan, including pricing, the math to $1,000/day and the sales playbook, is in **[PLAN.md](PLAN.md)**.

```
Caller ──calls──▶ Twilio number ──▶ /voice/incoming
                                     ├─ forward mode: ring owner's cell (18s)
                                     │     └─ no answer ──▶ /voice/after-dial ─┐
                                     └─ missed-only mode (carrier forwards     │
                                        unanswered calls here) ────────────────┤
                                                                               ▼
                               text-back SMS to caller  +  "missed call" alert to owner
Caller ──texts──▶ /sms/incoming ──▶ Claude (structured JSON turn) ──▶ reply SMS
                                     └─ once qualified: lead summary to owner
                                     └─ emergency: instant 🚨 alert to owner
```

## Features

- **Two call modes:** use the Twilio number as the business line and ring the owner first, or keep the owner's
  existing number and have their carrier forward only unanswered calls
- **AI lead qualification** with Claude, using structured outputs so every turn returns a reply plus extracted fields
- **Owner alerts** by SMS: missed call, qualified lead, emergency, and any texts after the lead is qualified
- **Safety rails:** never quotes prices or books appointments; emergency guidance (get safe, call 911 or the utility); hands
  off to the owner after 12 texts; falls back to a canned reply and forwards the text to the owner if the AI is unavailable
- **Compliance basics:** opt-out language in the first text; STOP/START tracking; no texts to opted-out callers
- **Owner dashboard** at a private link, with every lead, its urgency and its status
- **Admin API** to onboard a new customer in one request
- Twilio webhook signature verification

## Run it locally

```bash
python -m venv .venv && . .venv/bin/activate
pip install -r requirements-dev.txt
pytest                      # 19 tests, no network or API keys needed

cp .env.example .env        # fill in your keys
set -a && . ./.env && set +a
uvicorn leadback.app:create_app --factory --reload
```

To test with real phones, expose the app over HTTPS (for example with `ngrok http 8000`) and set `PUBLIC_BASE_URL` to that URL.

## Deploy

Any host that runs a Docker container and has a persistent disk will work (Render, Fly.io, Railway, a $6 VPS):

```bash
docker build -t leadback .
docker run -p 8000:8000 --env-file .env -v leadback-data:/data leadback
```

The database is SQLite at `DATABASE_PATH`, so mount a persistent volume. That's plenty for hundreds of customers.

## Onboard a customer

1. In Twilio, buy a local number in the customer's area code.
2. Register it with your A2P 10DLC campaign (required for business SMS in the US).
3. Create the business:

```bash
curl -X POST "$PUBLIC_BASE_URL/admin/businesses" \
  -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d '{
    "name": "Ace Plumbing",
    "twilio_number": "+15550001111",
    "owner_cell": "+15550002222",
    "services": "plumbing repair, water heaters, drains",
    "service_area": "Springfield and nearby towns",
    "hours": "Mon-Sat 7am-6pm",
    "forward_to_owner": true
  }'
```

The response includes the owner's private `dashboard_url` and the two webhook URLs.

4. In the Twilio console, set the number's **"A call comes in"** webhook to `/voice/incoming` and its
   **"A message comes in"** webhook to `/sms/incoming` (both HTTP POST).
5. **Forward mode** (`forward_to_owner: true`): the customer puts the new number on Google, their trucks and their website.
   **Missed-only mode** (`false`): the customer keeps their number and sets their carrier's "forward when unanswered"
   (conditional call forwarding) to the Twilio number. This is easier to sell, because nothing changes for them.

## Code map

| File | What it does |
|---|---|
| `leadback/app.py` | FastAPI routes: Twilio webhooks, dashboard, admin API |
| `leadback/service.py` | What happens on a missed call and on each inbound text |
| `leadback/ai.py` | Claude prompt, JSON schema and response handling |
| `leadback/db.py` | SQLite storage for businesses, leads and messages |
| `leadback/sms.py` | Twilio SMS sender |
| `tests/` | End-to-end tests with a fake AI and a fake SMS sender |

## Next steps (in order of revenue impact)

1. **Monthly proof report:** text/email each owner "we caught X missed calls, Y became leads". This is the main defense against churn.
2. **Stripe billing and self-serve signup**, so you're not onboarding by hand past ~30 customers.
3. **Voicemail detection** in forward mode (call screening: "press 1 to accept").
4. **Booking:** let the AI offer open slots from the owner's calendar.
5. **CRM push** (Jobber, Housecall Pro, ServiceTitan) so leads land where the owner already works.
