"""Business logic: what happens on a missed call and on each inbound text."""

import logging

from .ai import AgentTurn, LeadAgent
from .db import Database
from .sms import SmsSender

log = logging.getLogger(__name__)

# After this many customer texts on one lead, stop the AI and hand the thread to the owner.
MAX_AI_TURNS = 12

OPT_OUT_WORDS = {"stop", "stopall", "unsubscribe", "cancel", "end", "quit", "revoke", "optout"}
OPT_IN_WORDS = {"start", "unstop", "yes"}


def text_back_message(business: dict, first_contact: bool) -> str:
    if first_contact:
        return (
            f"Hi, this is {business['name']}. Sorry we missed your call! "
            "What can we help you with? (Reply STOP to opt out)"
        )
    return f"Hi again from {business['name']}, sorry we missed you. What can we help with?"


def owner_lead_alert(lead: dict, emergency: bool = False) -> str:
    header = "🚨 EMERGENCY lead" if emergency else "✅ New lead"
    lines = [
        f"{header}: {lead['name'] or 'Unknown name'}",
        f"Job: {lead['service'] or '?'}",
        f"Where: {lead['address'] or '?'}",
        f"When: {lead['preferred_time'] or '?'} (urgency: {lead['urgency']})",
        f"Call/text: {lead['caller_phone']}",
    ]
    if lead["summary"]:
        lines.append(lead["summary"])
    return "\n".join(lines)


class LeadBack:
    def __init__(self, db: Database, agent: LeadAgent, sender: SmsSender):
        self.db = db
        self.agent = agent
        self.sender = sender

    def _text_customer(self, business: dict, lead: dict, body: str) -> None:
        self.db.add_message(lead["id"], "out", body)
        self.sender.send(business["twilio_number"], lead["caller_phone"], body)

    def _text_owner(self, business: dict, body: str) -> None:
        self.sender.send(business["twilio_number"], business["owner_cell"], body)

    def handle_missed_call(self, business: dict, caller: str) -> None:
        lead, created = self.db.find_or_create_lead(business["id"], caller)
        if lead["status"] == "opted_out":
            self._text_owner(business, f"Missed call from {caller} (opted out of texts, call them back).")
            return

        first_contact = created or not self.db.messages_for_lead(lead["id"])
        self._text_customer(business, lead, text_back_message(business, first_contact))
        if first_contact:
            self._text_owner(business, f"📞 Missed call from {caller}. We texted them back; details coming.")
        else:
            self._text_owner(business, f"📞 {caller} called again. {lead['summary']}".strip())

    def handle_inbound_sms(self, business: dict, caller: str, body: str) -> None:
        lead, _ = self.db.find_or_create_lead(business["id"], caller)
        self.db.add_message(lead["id"], "in", body)
        keyword = body.strip().lower().rstrip("!.")

        # Carriers and Twilio send the STOP/START confirmations themselves; just record the state.
        if keyword in OPT_OUT_WORDS:
            self.db.update_lead(lead["id"], status="opted_out")
            return
        if lead["status"] == "opted_out":
            if keyword in OPT_IN_WORDS:
                self.db.update_lead(lead["id"], status="qualifying")
            return

        if lead["status"] == "handed_off":
            self._text_owner(business, f"💬 {lead['name'] or caller}: {body}")
            return

        transcript = self.db.messages_for_lead(lead["id"])
        if sum(m["direction"] == "in" for m in transcript) > MAX_AI_TURNS:
            self.db.update_lead(lead["id"], status="handed_off")
            self._text_customer(
                business, lead, f"Thanks! I've passed this to the team at {business['name']}, they'll text you directly."
            )
            self._text_owner(business, f"💬 Handing {lead['name'] or caller} to you: {body}")
            return

        turn = self.agent.respond(business, transcript)
        self._text_customer(business, lead, turn.reply)
        self._apply_turn(business, lead, turn, body)

    def _apply_turn(self, business: dict, lead: dict, turn: AgentTurn, body: str) -> None:
        if turn.degraded:
            # Nothing the customer said gets lost if the AI is down.
            self._text_owner(business, f"💬 {lead['name'] or lead['caller_phone']}: {body}")
            return

        # Keep previously collected details if the model leaves a field blank this turn.
        updates = {
            f: getattr(turn, f)
            for f in ("name", "service", "address", "preferred_time", "summary")
            if getattr(turn, f)
        }
        if turn.urgency != "unknown":
            updates["urgency"] = turn.urgency
        was_qualified = lead["status"] == "qualified"
        if turn.qualified:
            updates["status"] = "qualified"
        updated = self.db.update_lead(lead["id"], **updates)

        became_emergency = updated["urgency"] == "emergency" and lead["urgency"] != "emergency"
        if became_emergency:
            self._text_owner(business, owner_lead_alert(updated, emergency=True))
        elif turn.qualified and not was_qualified:
            self._text_owner(business, owner_lead_alert(updated))
        elif was_qualified:
            self._text_owner(business, f"💬 {updated['name'] or updated['caller_phone']}: {body}")
