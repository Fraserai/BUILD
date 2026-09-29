"""The AI side of the conversation: texts the caller back and collects job details."""

import json
import logging
from dataclasses import dataclass, field
from typing import Protocol

import anthropic

log = logging.getLogger(__name__)

MODEL = "claude-opus-5-5"

URGENCY_LEVELS = ("unknown", "routine", "soon", "emergency")

TURN_SCHEMA = {
    "type": "object",
    "properties": {
        "reply": {
            "type": "string",
            "description": "The next SMS to send the customer. Plain text, under 300 characters.",
        },
        "name": {"type": "string", "description": "Customer's name, or empty if unknown."},
        "service": {"type": "string", "description": "What they need done, or empty if unknown."},
        "address": {"type": "string", "description": "Job address or town, or empty if unknown."},
        "urgency": {"type": "string", "enum": list(URGENCY_LEVELS)},
        "preferred_time": {
            "type": "string",
            "description": "When they'd like the work or a call back, or empty if unknown.",
        },
        "qualified": {
            "type": "boolean",
            "description": "True once the owner has enough to call back and quote: name, service and address.",
        },
        "summary": {
            "type": "string",
            "description": "One sentence for the business owner summarizing the job so far.",
        },
    },
    "required": [
        "reply",
        "name",
        "service",
        "address",
        "urgency",
        "preferred_time",
        "qualified",
        "summary",
    ],
    "additionalProperties": False,
}

SYSTEM_TEMPLATE = """You are the text-message assistant for {name}, a local home-service business. \
A customer just called {name} and nobody could pick up, so an automatic text went out. \
You are now texting with that customer.

About the business:
- Services: {services}
- Service area: {service_area}
- Hours: {hours}

Your job is to collect what the owner needs to call back and quote the job:
1. The customer's name
2. What they need done (the more specific the better)
3. The job address, or at least the town
4. How urgent it is, and when works for them

How to text:
- Keep every message short and friendly, like a helpful office manager. Ask one thing at a time.
- Don't quote prices, promise arrival times, or book appointments; say the owner will confirm those.
- If asked whether you're a person, say you're {name}'s automated text assistant and the owner will follow up personally.
- If they describe danger (gas smell, sparking, flooding near electrics, fire, carbon monoxide), \
tell them to get to safety and call 911 or their utility right away, and set urgency to "emergency".
- If the job is clearly outside the listed services or area, say so politely and that the owner will let them know if they can help.
- Once you have name, service and address, set qualified to true, thank them, and say the owner will reach out shortly. \
Keep answering briefly if they text more.
- Fill in every field from the whole conversation so far, not only the latest message."""


@dataclass
class AgentTurn:
    reply: str
    name: str = ""
    service: str = ""
    address: str = ""
    urgency: str = "unknown"
    preferred_time: str = ""
    qualified: bool = False
    summary: str = ""
    # True when the model could not produce a normal turn and a canned reply was used.
    degraded: bool = False
    raw: dict = field(default_factory=dict, repr=False)


class LeadAgent(Protocol):
    def respond(self, business: dict, transcript: list[dict]) -> AgentTurn: ...


def fallback_turn(business: dict) -> AgentTurn:
    return AgentTurn(
        reply=f"Thanks for the details! Someone from {business['name']} will get back to you shortly.",
        degraded=True,
    )


def build_messages(transcript: list[dict]) -> list[dict]:
    """Turn stored SMS history into Messages API turns.

    The conversation starts with our automatic text-back (an assistant turn), and the API
    requires a user turn first, so a short note about the missed call leads it off.
    """
    messages = [{"role": "user", "content": "[The customer called and the call was missed.]"}]
    for msg in transcript:
        role = "user" if msg["direction"] == "in" else "assistant"
        if messages[-1]["role"] == role:
            messages[-1]["content"] += "\n" + msg["body"]
        else:
            messages.append({"role": role, "content": msg["body"]})
    if messages[-1]["role"] != "user":
        raise ValueError("transcript must end with a customer message")
    return messages


class ClaudeLeadAgent:
    def __init__(self, client: anthropic.Anthropic | None = None, model: str = MODEL):
        self.client = client or anthropic.Anthropic()
        self.model = model

    def respond(self, business: dict, transcript: list[dict]) -> AgentTurn:
        system = SYSTEM_TEMPLATE.format(
            name=business["name"],
            services=business["services"] or "general home services",
            service_area=business["service_area"] or "local area",
            hours=business["hours"] or "not specified",
        )
        try:
            response = self.client.beta.messages.create(
                model=self.model,
                max_tokens=16000,
                system=system,
                messages=build_messages(transcript),
                output_config={
                    "effort": "low",
                    "format": {"type": "json_schema", "schema": TURN_SCHEMA},
                },
                # On a safety decline, retry server-side on Anthropic's recommended fallback model.
                betas=["server-side-fallback-2026-07-01"],
                fallbacks="default",
            )
        except anthropic.APIConnectionError:
            log.exception("Claude API unreachable")
            return fallback_turn(business)
        except anthropic.APIStatusError as e:
            log.error("Claude API error %s (request %s): %s", e.status_code, e.request_id, e.message)
            return fallback_turn(business)

        if response.stop_reason != "end_turn":
            log.warning("Unexpected stop_reason %s (request %s)", response.stop_reason, response._request_id)
            return fallback_turn(business)

        text = next((b.text for b in response.content if b.type == "text"), "")
        try:
            data = json.loads(text)
        except json.JSONDecodeError:
            log.warning("Unparseable model output (request %s)", response._request_id)
            return fallback_turn(business)

        urgency = data.get("urgency", "unknown")
        return AgentTurn(
            reply=data["reply"].strip() or fallback_turn(business).reply,
            name=data.get("name", ""),
            service=data.get("service", ""),
            address=data.get("address", ""),
            urgency=urgency if urgency in URGENCY_LEVELS else "unknown",
            preferred_time=data.get("preferred_time", ""),
            qualified=bool(data.get("qualified")),
            summary=data.get("summary", ""),
            raw=data,
        )
