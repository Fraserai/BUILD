import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    twilio_account_sid: str
    twilio_auth_token: str
    public_base_url: str
    admin_token: str
    database_path: str
    validate_twilio_signature: bool

    @classmethod
    def from_env(cls) -> "Settings":
        return cls(
            twilio_account_sid=os.environ.get("TWILIO_ACCOUNT_SID", ""),
            twilio_auth_token=os.environ.get("TWILIO_AUTH_TOKEN", ""),
            public_base_url=os.environ.get("PUBLIC_BASE_URL", "").rstrip("/"),
            admin_token=os.environ.get("ADMIN_TOKEN", ""),
            database_path=os.environ.get("DATABASE_PATH", "leadback.db"),
            validate_twilio_signature=os.environ.get("VALIDATE_TWILIO_SIGNATURE", "true").lower()
            != "false",
        )
