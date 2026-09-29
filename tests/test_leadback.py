import json
from types import SimpleNamespace

import anthropic
import httpx
import pytest
from fastapi.testclient import TestClient
from twilio.request_validator import RequestValidator

from leadback.ai import AgentTurn, ClaudeLeadAgent, build_messages
from leadback.app import create_app
from leadback.config import Settings
from leadback.service import MAX_AI_TURNS

BIZ_NUMBER = "+15550001111"
OWNER = "+15550002222"
CALLER = "+15553334444"


class FakeSender:
    def __init__(self):
        self.sent: list[tuple[str, str, str]] = []

    def send(self, from_number, to_number, body):
        self.sent.append((from_number, to_number, body))

    def to(self, number):
        return [body for _, to, body in self.sent if to == number]


class FakeAgent:
    """Replays scripted turns and records what it was shown."""

    def __init__(self, turns=None):
        self.turns = list(turns or [])
        self.transcripts = []

    def respond(self, business, transcript):
        self.transcripts.append(transcript)
        if self.turns:
            return self.turns.pop(0)
        return AgentTurn(reply="Got it, anything else?")


def make_settings(tmp_path, **overrides):
    values = dict(
        twilio_account_sid="AC123",
        twilio_auth_token="secret",
        public_base_url="https://leadback.test",
        admin_token="admin-token",
        database_path=str(tmp_path / "test.db"),
        validate_twilio_signature=False,
    )
    values.update(overrides)
    return Settings(**values)


@pytest.fixture
def env(tmp_path):
    sender, agent = FakeSender(), FakeAgent()
    client = TestClient(create_app(make_settings(tmp_path), agent=agent, sender=sender))
    resp = client.post(
        "/admin/businesses",
        headers={"Authorization": "Bearer admin-token"},
        json={
            "name": "Ace Plumbing",
            "twilio_number": BIZ_NUMBER,
            "owner_cell": OWNER,
            "services": "plumbing repair, water heaters, drains",
            "service_area": "Springfield and nearby towns",
            "hours": "Mon-Sat 7am-6pm",
        },
    )
    assert resp.status_code == 200
    return SimpleNamespace(client=client, sender=sender, agent=agent, business=resp.json())


def call(client, path, **form):
    return client.post(path, data={"To": BIZ_NUMBER, "From": CALLER, **form})


def text(client, body):
    return call(client, "/sms/incoming", Body=body)


def test_forwarding_business_rings_owner_first(env):
    resp = call(env.client, "/voice/incoming")
    assert resp.status_code == 200
    assert f"<Number>{OWNER}</Number>" in resp.text
    assert 'action="/voice/after-dial"' in resp.text
    assert env.sender.sent == []


def test_answered_call_sends_nothing(env):
    resp = call(env.client, "/voice/after-dial", DialCallStatus="completed")
    assert "<Hangup />" in resp.text
    assert env.sender.sent == []


def test_missed_call_texts_caller_and_alerts_owner(env):
    resp = call(env.client, "/voice/after-dial", DialCallStatus="no-answer")
    assert "<Say>" in resp.text
    [to_caller] = env.sender.to(CALLER)
    assert "Ace Plumbing" in to_caller and "STOP" in to_caller
    [to_owner] = env.sender.to(OWNER)
    assert CALLER in to_owner
    assert all(frm == BIZ_NUMBER for frm, _, _ in env.sender.sent)


def test_missed_only_mode_texts_back_immediately(tmp_path):
    sender = FakeSender()
    client = TestClient(create_app(make_settings(tmp_path), agent=FakeAgent(), sender=sender))
    client.post(
        "/admin/businesses",
        headers={"Authorization": "Bearer admin-token"},
        json={"name": "Bob's HVAC", "twilio_number": BIZ_NUMBER, "owner_cell": OWNER, "forward_to_owner": False},
    )
    resp = call(client, "/voice/incoming")
    assert "<Dial" not in resp.text
    assert len(sender.to(CALLER)) == 1


def test_full_conversation_qualifies_lead_and_alerts_owner(env):
    env.agent.turns = [
        AgentTurn(reply="Sorry to hear that! What's your name?", service="leaking water heater", urgency="soon"),
        AgentTurn(
            reply="Thanks Dana! What's the address?",
            name="Dana",
            summary="Dana has a leaking water heater.",
        ),
        AgentTurn(
            reply="Perfect, the owner will reach out shortly.",
            address="12 Elm St, Springfield",
            qualified=True,
            summary="Dana, 12 Elm St: water heater leaking, wants a visit this week.",
        ),
    ]
    call(env.client, "/voice/after-dial", DialCallStatus="no-answer")
    text(env.client, "My water heater is leaking")
    text(env.client, "Dana")
    text(env.client, "12 Elm St")

    caller_msgs = env.sender.to(CALLER)
    assert caller_msgs[-1] == "Perfect, the owner will reach out shortly."
    alert = env.sender.to(OWNER)[-1]
    assert "New lead" in alert
    # Fields collected on earlier turns survive later turns that leave them blank.
    assert "Dana" in alert and "leaking water heater" in alert and "12 Elm St" in alert
    assert "soon" in alert

    # The model saw the whole thread, starting with our text-back.
    last = env.agent.transcripts[-1]
    assert [m["direction"] for m in last] == ["out", "in", "out", "in", "out", "in"]

    page = env.client.get("/dashboard", params={"token": env.business["dashboard_token"]})
    assert page.status_code == 200
    assert "Dana" in page.text and "1 ready to quote" in page.text


def test_messages_after_qualified_are_relayed_to_owner(env):
    env.agent.turns = [AgentTurn(reply="Thanks!", name="Dana", service="drain", address="Elm St", qualified=True)]
    text(env.client, "Clogged drain at Elm St, I'm Dana")
    text(env.client, "Also the garbage disposal is broken")
    assert env.sender.to(OWNER)[-1].endswith("Also the garbage disposal is broken")


def test_emergency_alerts_owner_before_qualified(env):
    env.agent.turns = [AgentTurn(reply="Please get outside and call the gas company.", urgency="emergency")]
    text(env.client, "I smell gas near the water heater")
    assert "EMERGENCY" in env.sender.to(OWNER)[-1]


def test_stop_opts_out_and_silences_everything(env):
    call(env.client, "/voice/after-dial", DialCallStatus="no-answer")
    before = len(env.sender.to(CALLER))
    text(env.client, "STOP")
    text(env.client, "hello?")
    call(env.client, "/voice/after-dial", DialCallStatus="no-answer")
    assert len(env.sender.to(CALLER)) == before
    assert env.agent.transcripts == []
    assert "opted out" in env.sender.to(OWNER)[-1]


def test_degraded_ai_forwards_message_to_owner(env):
    env.agent.turns = [AgentTurn(reply="Someone will get back to you shortly.", degraded=True)]
    text(env.client, "Need a quote for a new toilet")
    assert env.sender.to(CALLER) == ["Someone will get back to you shortly."]
    assert env.sender.to(OWNER)[-1].endswith("Need a quote for a new toilet")


def test_long_threads_hand_off_to_owner(env):
    for i in range(MAX_AI_TURNS + 2):
        text(env.client, f"message {i}")
    assert len(env.agent.transcripts) == MAX_AI_TURNS
    assert "passed this to the team" in env.sender.to(CALLER)[MAX_AI_TURNS]
    assert env.sender.to(OWNER)[-1].endswith(f"message {MAX_AI_TURNS + 1}")


def test_unknown_number_is_rejected(env):
    resp = env.client.post("/sms/incoming", data={"To": "+15559999999", "From": CALLER, "Body": "hi"})
    assert resp.status_code == 404


def test_admin_requires_token(env):
    assert env.client.get("/admin/businesses").status_code == 401
    ok = env.client.get("/admin/businesses", headers={"Authorization": "Bearer admin-token"})
    assert ok.status_code == 200 and len(ok.json()) == 1


def test_dashboard_requires_valid_token(env):
    assert env.client.get("/dashboard", params={"token": "nope"}).status_code == 404


def test_twilio_signature_is_enforced(tmp_path):
    settings = make_settings(tmp_path, validate_twilio_signature=True)
    sender = FakeSender()
    client = TestClient(create_app(settings, agent=FakeAgent(), sender=sender))
    client.post(
        "/admin/businesses",
        headers={"Authorization": "Bearer admin-token"},
        json={"name": "Ace", "twilio_number": BIZ_NUMBER, "owner_cell": OWNER},
    )
    form = {"To": BIZ_NUMBER, "From": CALLER, "Body": "hi"}
    assert client.post("/sms/incoming", data=form).status_code == 403

    signature = RequestValidator("secret").compute_signature("https://leadback.test/sms/incoming", form)
    resp = client.post("/sms/incoming", data=form, headers={"X-Twilio-Signature": signature})
    assert resp.status_code == 200


# ClaudeLeadAgent, against a stubbed Anthropic client

BUSINESS = {"name": "Ace Plumbing", "services": "plumbing", "service_area": "Springfield", "hours": ""}
TRANSCRIPT = [
    {"direction": "out", "body": "Hi, this is Ace Plumbing. What can we help with?"},
    {"direction": "in", "body": "Leaky faucet"},
    {"direction": "in", "body": "In Springfield"},
]


class StubMessages:
    def __init__(self, result):
        self.result = result
        self.kwargs = None

    def create(self, **kwargs):
        self.kwargs = kwargs
        if isinstance(self.result, Exception):
            raise self.result
        return self.result


def stub_client(result):
    messages = StubMessages(result)
    return SimpleNamespace(beta=SimpleNamespace(messages=messages)), messages


def model_response(payload, stop_reason="end_turn"):
    text = payload if isinstance(payload, str) else json.dumps(payload)
    return SimpleNamespace(
        stop_reason=stop_reason,
        content=[SimpleNamespace(type="thinking"), SimpleNamespace(type="text", text=text)],
        _request_id="req_test",
    )


def test_build_messages_starts_with_user_and_merges_consecutive_texts():
    messages = build_messages(TRANSCRIPT)
    assert [m["role"] for m in messages] == ["user", "assistant", "user"]
    assert messages[-1]["content"] == "Leaky faucet\nIn Springfield"


def test_claude_agent_parses_structured_turn():
    payload = {
        "reply": "Thanks! What's your name?",
        "name": "",
        "service": "leaky faucet",
        "address": "Springfield",
        "urgency": "routine",
        "preferred_time": "",
        "qualified": False,
        "summary": "Leaky faucet in Springfield.",
    }
    client, messages = stub_client(model_response(payload))
    turn = ClaudeLeadAgent(client=client).respond(BUSINESS, TRANSCRIPT)
    assert turn.reply == "Thanks! What's your name?"
    assert turn.service == "leaky faucet" and turn.urgency == "routine" and not turn.degraded

    kwargs = messages.kwargs
    assert kwargs["model"] == "claude-opus-5-5"
    assert kwargs["output_config"]["format"]["type"] == "json_schema"
    assert kwargs["fallbacks"] == "default"
    assert "Ace Plumbing" in kwargs["system"]


@pytest.mark.parametrize(
    "result",
    [
        model_response("", stop_reason="refusal"),
        model_response("not json"),
        anthropic.APIConnectionError(request=httpx.Request("POST", "https://api.anthropic.com")),
    ],
    ids=["refusal", "bad-json", "connection-error"],
)
def test_claude_agent_degrades_gracefully(result):
    client, _ = stub_client(result)
    turn = ClaudeLeadAgent(client=client).respond(BUSINESS, TRANSCRIPT)
    assert turn.degraded
    assert "Ace Plumbing" in turn.reply
