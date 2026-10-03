"""Refresh the AUDit data files.

- data/fx.json: today's USD->AUD reference rate (ECB via Frankfurter, with a fallback feed).
- data/models.json: list prices for closed models marked ``autoPrice`` and per-host
  prices for open-weight models, both from the public OpenRouter API.

Standard library only so it runs anywhere, including a bare GitHub Actions runner.
Usage: python audit/scripts/refresh_data.py [--skip-fx] [--skip-prices]
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import sys
import urllib.error
import urllib.request
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data"
OPENROUTER = "https://openrouter.ai/api/v1"
FX_SOURCES = [
    ("ECB reference rate (Frankfurter)", "https://api.frankfurter.dev/v1/latest?base=USD&symbols=AUD"),
    ("open.er-api.com", "https://open.er-api.com/v6/latest/USD"),
]
PER_MILLION = 1_000_000
MAX_PROVIDERS = 8


def fetch_json(url: str, timeout: float = 20) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": "AUDit-data-refresh/1.0"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.load(resp)


def per_million(value) -> float | None:
    """OpenRouter quotes USD per token as a string. Return USD per 1M tokens, or None."""
    try:
        v = float(value)
    except (TypeError, ValueError):
        return None
    if v <= 0:
        return None
    return round(v * PER_MILLION, 4)


def parse_fx(payload: dict) -> float | None:
    rates = payload.get("rates") or {}
    rate = rates.get("AUD")
    try:
        rate = float(rate)
    except (TypeError, ValueError):
        return None
    # Sanity bounds: AUD has not traded outside this band in decades.
    return rate if 0.8 < rate < 2.5 else None


def refresh_fx(today: str) -> bool:
    for name, url in FX_SOURCES:
        try:
            payload = fetch_json(url)
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
            print(f"fx: {name} failed: {exc}", file=sys.stderr)
            continue
        rate = parse_fx(payload)
        if rate is None:
            print(f"fx: {name} returned no usable AUD rate", file=sys.stderr)
            continue
        fx = {
            "usd_aud": round(rate, 4),
            "date": payload.get("date") or today,
            "source": name,
            "source_url": url,
        }
        write_json(DATA / "fx.json", fx)
        print(f"fx: US$1 = A${fx['usd_aud']} ({name}, {fx['date']})")
        return True
    return False


def apply_list_price(model: dict, entry: dict) -> bool:
    """Update a closed model's headline price from an OpenRouter model entry."""
    pricing = entry.get("pricing") or {}
    new_in = per_million(pricing.get("prompt"))
    new_out = per_million(pricing.get("completion"))
    if new_in is None or new_out is None:
        return False
    price = model["price"]
    changed = price.get("in") != new_in or price.get("out") != new_out
    price["in"], price["out"] = new_in, new_out
    cached = per_million(pricing.get("input_cache_read"))
    if cached is not None and price.get("cached") != cached:
        price["cached"] = cached
        changed = True
    return changed


def _metric(value) -> float | None:
    """Endpoint stats may be a bare number or a percentile dict like {"p50": 41.2}."""
    if isinstance(value, dict):
        value = value.get("p50")
    try:
        v = float(value)
    except (TypeError, ValueError):
        return None
    return v if v > 0 else None


def merge_providers(model: dict, endpoints: list[dict]) -> bool:
    """Replace OpenRouter-sourced host prices, keeping hand-entered ones it doesn't cover."""
    fresh = []
    for ep in endpoints:
        pricing = ep.get("pricing") or {}
        p_in = per_million(pricing.get("prompt"))
        p_out = per_million(pricing.get("completion"))
        name = ep.get("provider_name") or ep.get("name")
        if not name or p_in is None:
            continue
        if p_out is None:
            continue
        row = {"name": name, "in": p_in, "out": p_out, "via": "openrouter"}
        cached = per_million(pricing.get("input_cache_read"))
        if cached is not None:
            row["cached"] = cached
        if ep.get("quantization") and ep["quantization"] not in ("unknown", ""):
            row["quant"] = ep["quantization"]
        tps = _metric(ep.get("throughput_last_30m"))
        if tps:
            row["tps"] = round(tps)
        latency = _metric(ep.get("latency_last_30m"))
        if latency:
            # OpenRouter reports latency in milliseconds.
            row["ttft"] = round(latency / 1000, 2)
        fresh.append(row)
    if not fresh:
        return False
    fresh.sort(key=lambda r: (r["in"], r.get("out", 0)))
    fresh = fresh[:MAX_PROVIDERS]
    covered = {r["name"].lower() for r in fresh}
    official = {p["name"].split(" (")[0].lower() for p in model.get("providers", []) if p.get("official")}
    for r in fresh:
        if r["name"].lower() in official:
            r["official"] = True
    kept = [
        p
        for p in model.get("providers", [])
        if p.get("via") != "openrouter" and p["name"].split(" (")[0].lower() not in covered
    ]
    merged = kept + fresh
    changed = merged != model.get("providers")
    model["providers"] = merged
    return changed


def refresh_prices(today: str) -> bool:
    path = DATA / "models.json"
    doc = json.loads(path.read_text())
    try:
        listing = {m["id"]: m for m in fetch_json(f"{OPENROUTER}/models")["data"]}
    except (urllib.error.URLError, TimeoutError, KeyError, json.JSONDecodeError) as exc:
        print(f"prices: OpenRouter model list failed: {exc}", file=sys.stderr)
        return False

    changed = False
    for model in doc["models"]:
        slug = model.get("openrouter")
        if not slug:
            continue
        entry = listing.get(slug)
        if entry is None:
            print(f"prices: {slug} not listed on OpenRouter, keeping saved price", file=sys.stderr)
            continue
        if model.get("autoPrice") and apply_list_price(model, entry):
            print(f"prices: updated {model['name']} to {model['price']}")
            changed = True
        if model.get("open"):
            try:
                eps = fetch_json(f"{OPENROUTER}/models/{slug}/endpoints")["data"]["endpoints"]
            except (urllib.error.URLError, TimeoutError, KeyError, TypeError, json.JSONDecodeError) as exc:
                print(f"prices: endpoints for {slug} failed: {exc}", file=sys.stderr)
                continue
            if merge_providers(model, eps):
                print(f"prices: refreshed hosts for {model['name']}")
                changed = True

    doc["updated"] = today
    write_json(path, doc)
    if not changed:
        print("prices: no price changes")
    return True


def write_json(path: Path, obj: dict) -> None:
    path.write_text(json.dumps(obj, indent=2, ensure_ascii=False) + "\n")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--skip-fx", action="store_true")
    parser.add_argument("--skip-prices", action="store_true")
    args = parser.parse_args(argv)
    today = dt.datetime.now(dt.timezone(dt.timedelta(hours=10))).date().isoformat()  # AEST

    ok = []
    if not args.skip_fx:
        ok.append(refresh_fx(today))
    if not args.skip_prices:
        ok.append(refresh_prices(today))
    if ok and not any(ok):
        print("Nothing could be refreshed. Check network access.", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
