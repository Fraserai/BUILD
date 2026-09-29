"""SQLite storage for businesses (your customers), leads (their callers) and SMS messages."""

import secrets
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone

SCHEMA = """
CREATE TABLE IF NOT EXISTS businesses (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    twilio_number TEXT NOT NULL UNIQUE,
    owner_cell TEXT NOT NULL,
    services TEXT NOT NULL DEFAULT '',
    service_area TEXT NOT NULL DEFAULT '',
    hours TEXT NOT NULL DEFAULT '',
    -- 1: the Twilio number is the published number; ring the owner first.
    -- 0: the owner's carrier forwards only unanswered calls here.
    forward_to_owner INTEGER NOT NULL DEFAULT 1,
    dashboard_token TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY,
    business_id INTEGER NOT NULL REFERENCES businesses(id),
    caller_phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'qualifying',  -- qualifying | qualified | handed_off | opted_out
    name TEXT NOT NULL DEFAULT '',
    service TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    urgency TEXT NOT NULL DEFAULT 'unknown',
    preferred_time TEXT NOT NULL DEFAULT '',
    summary TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS leads_by_caller ON leads(business_id, caller_phone, updated_at);

CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY,
    lead_id INTEGER NOT NULL REFERENCES leads(id),
    direction TEXT NOT NULL,  -- in | out
    body TEXT NOT NULL,
    created_at TEXT NOT NULL
);
"""

LEAD_FIELDS = ("name", "service", "address", "urgency", "preferred_time", "summary")

# A caller who texts again within this window continues the same lead.
LEAD_REUSE_WINDOW = timedelta(days=7)


def now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


class Database:
    def __init__(self, path: str):
        self.path = path
        with self._connect() as conn:
            conn.executescript(SCHEMA)

    @contextmanager
    def _connect(self):
        conn = sqlite3.connect(self.path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        try:
            yield conn
            conn.commit()
        finally:
            conn.close()

    # Businesses

    def add_business(
        self,
        name: str,
        twilio_number: str,
        owner_cell: str,
        services: str = "",
        service_area: str = "",
        hours: str = "",
        forward_to_owner: bool = True,
    ) -> dict:
        with self._connect() as conn:
            cur = conn.execute(
                """INSERT INTO businesses
                   (name, twilio_number, owner_cell, services, service_area, hours,
                    forward_to_owner, dashboard_token, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    name,
                    twilio_number,
                    owner_cell,
                    services,
                    service_area,
                    hours,
                    int(forward_to_owner),
                    secrets.token_urlsafe(24),
                    now(),
                ),
            )
            return dict(conn.execute("SELECT * FROM businesses WHERE id = ?", (cur.lastrowid,)).fetchone())

    def list_businesses(self) -> list[dict]:
        with self._connect() as conn:
            return [dict(r) for r in conn.execute("SELECT * FROM businesses ORDER BY id")]

    def business_by_number(self, twilio_number: str) -> dict | None:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT * FROM businesses WHERE twilio_number = ?", (twilio_number,)
            ).fetchone()
            return dict(row) if row else None

    def business_by_token(self, token: str) -> dict | None:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT * FROM businesses WHERE dashboard_token = ?", (token,)
            ).fetchone()
            return dict(row) if row else None

    # Leads

    def find_or_create_lead(self, business_id: int, caller_phone: str) -> tuple[dict, bool]:
        """Return (lead, created). Reuses the caller's most recent lead if it is still fresh."""
        cutoff = (datetime.now(timezone.utc) - LEAD_REUSE_WINDOW).isoformat(timespec="seconds")
        with self._connect() as conn:
            row = conn.execute(
                """SELECT * FROM leads
                   WHERE business_id = ? AND caller_phone = ? AND updated_at >= ?
                   ORDER BY updated_at DESC LIMIT 1""",
                (business_id, caller_phone, cutoff),
            ).fetchone()
            if row:
                return dict(row), False
            ts = now()
            cur = conn.execute(
                "INSERT INTO leads (business_id, caller_phone, created_at, updated_at) VALUES (?, ?, ?, ?)",
                (business_id, caller_phone, ts, ts),
            )
            return dict(conn.execute("SELECT * FROM leads WHERE id = ?", (cur.lastrowid,)).fetchone()), True

    def get_lead(self, lead_id: int) -> dict:
        with self._connect() as conn:
            return dict(conn.execute("SELECT * FROM leads WHERE id = ?", (lead_id,)).fetchone())

    def update_lead(self, lead_id: int, **fields) -> dict:
        allowed = set(LEAD_FIELDS) | {"status"}
        unknown = set(fields) - allowed
        if unknown:
            raise ValueError(f"unknown lead fields: {sorted(unknown)}")
        fields["updated_at"] = now()
        assignments = ", ".join(f"{k} = ?" for k in fields)
        with self._connect() as conn:
            conn.execute(f"UPDATE leads SET {assignments} WHERE id = ?", (*fields.values(), lead_id))
        return self.get_lead(lead_id)

    def leads_for_business(self, business_id: int, limit: int = 200) -> list[dict]:
        with self._connect() as conn:
            return [
                dict(r)
                for r in conn.execute(
                    "SELECT * FROM leads WHERE business_id = ? ORDER BY created_at DESC LIMIT ?",
                    (business_id, limit),
                )
            ]

    # Messages

    def add_message(self, lead_id: int, direction: str, body: str) -> None:
        ts = now()
        with self._connect() as conn:
            conn.execute(
                "INSERT INTO messages (lead_id, direction, body, created_at) VALUES (?, ?, ?, ?)",
                (lead_id, direction, body, ts),
            )
            conn.execute("UPDATE leads SET updated_at = ? WHERE id = ?", (ts, lead_id))

    def messages_for_lead(self, lead_id: int) -> list[dict]:
        with self._connect() as conn:
            return [
                dict(r)
                for r in conn.execute(
                    "SELECT * FROM messages WHERE lead_id = ? ORDER BY id", (lead_id,)
                )
            ]
