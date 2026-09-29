import logging
from typing import Protocol

from twilio.rest import Client

log = logging.getLogger(__name__)


class SmsSender(Protocol):
    def send(self, from_number: str, to_number: str, body: str) -> None: ...


class TwilioSender:
    def __init__(self, account_sid: str, auth_token: str):
        self.client = Client(account_sid, auth_token)

    def send(self, from_number: str, to_number: str, body: str) -> None:
        msg = self.client.messages.create(from_=from_number, to=to_number, body=body)
        log.info("Sent SMS %s to %s", msg.sid, to_number)
