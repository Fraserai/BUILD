"""Checks for the AUDit price site: data files are well formed and the refresh script merges safely."""

import importlib.util
import json
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent / "audit"
spec = importlib.util.spec_from_file_location("refresh_data", ROOT / "scripts" / "refresh_data.py")
refresh = importlib.util.module_from_spec(spec)
spec.loader.exec_module(refresh)

AU_STATUSES = {"au-region", "self-host", "offshore"}


@pytest.fixture(scope="module")
def models():
    return json.loads((ROOT / "data" / "models.json").read_text())["models"]


def test_models_are_complete(models):
    ids = [m["id"] for m in models]
    assert len(ids) == len(set(ids)), "duplicate model ids"
    for m in models:
        assert m["name"] and m["lab"] and m["origin"]
        assert 0 < m["index"] <= 100
        assert m["price"]["in"] > 0 and m["price"]["out"] > 0
        assert m["au"]["status"] in AU_STATUSES
        assert m["sources"], f"{m['id']} has no sources"
        for p in m.get("providers", []):
            assert p["in"] > 0 and p["out"] > 0, f"{m['id']} provider {p['name']} needs input and output prices"
        assert m["auHosting"]["status"] in {"none", "available"}
        if m["auHosting"]["status"] == "available":
            assert m["auHosting"]["how"], f"{m['id']} must say how to get Australian hosting"
        for label, url in m["auHosting"].get("links", []):
            assert label and url.startswith("https://")
        if m["open"]:
            assert "weights" in m and m["weights"]["license"]
        else:
            assert m["au"]["status"] != "self-host"


def test_hardware_and_fx_files_load():
    hw = json.loads((ROOT / "data" / "hardware.json").read_text())
    assert all(d["aud"] > 0 and d["memory_gb"] > 0 for d in hw["local"])
    assert all(c["usd_hr"] > 0 for c in hw["cloud"])
    fx = json.loads((ROOT / "data" / "fx.json").read_text())
    assert 0.8 < fx["usd_aud"] < 2.5


def test_per_million_converts_and_rejects_junk():
    assert refresh.per_million("0.000004") == 4.0
    assert refresh.per_million("0") is None
    assert refresh.per_million("-1") is None
    assert refresh.per_million(None) is None
    assert refresh.per_million("free") is None


def test_parse_fx_rejects_out_of_band_rates():
    assert refresh.parse_fx({"rates": {"AUD": 1.4403}}) == 1.4403
    assert refresh.parse_fx({"rates": {"AUD": 144.03}}) is None
    assert refresh.parse_fx({"rates": {}}) is None


def test_apply_list_price_updates_and_keeps_bad_data_out():
    model = {"price": {"in": 4.0, "out": 20.0}}
    assert refresh.apply_list_price(model, {"pricing": {"prompt": "0.000003", "completion": "0.000015", "input_cache_read": "0.0000003"}})
    assert model["price"] == {"in": 3.0, "out": 15.0, "cached": 0.3}
    # A missing completion price must not zero out the saved price.
    assert not refresh.apply_list_price(model, {"pricing": {"prompt": "0.000001"}})
    assert model["price"]["in"] == 3.0


def test_merge_providers_replaces_covered_hosts_and_keeps_others():
    model = {
        "providers": [
            {"name": "Z.ai", "in": 1.4, "out": 4.4, "official": True},
            {"name": "Supernova (FP4)", "blended": 0.41},
            {"name": "OldHost", "in": 9.0, "via": "openrouter"},
        ]
    }
    endpoints = [
        {"provider_name": "Z.AI", "pricing": {"prompt": "0.0000014", "completion": "0.0000044", "input_cache_read": "0.0000003"}, "quantization": "fp8"},
        {"provider_name": "DeepInfra", "pricing": {"prompt": "0.0000004", "completion": "0.000002"},
         "throughput_last_30m": {"p50": 88.4}, "latency_last_30m": {"p50": 950}},
        {"provider_name": "Broken", "pricing": {"prompt": "0"}},
        {"provider_name": "NoOutput", "pricing": {"prompt": "0.000001"}},
    ]
    assert refresh.merge_providers(model, endpoints)
    names = [p["name"] for p in model["providers"]]
    assert names == ["Supernova (FP4)", "DeepInfra", "Z.AI"]
    deepinfra = model["providers"][1]
    assert deepinfra == {"name": "DeepInfra", "in": 0.4, "out": 2.0, "via": "openrouter", "tps": 88, "ttft": 0.95}
    zai = model["providers"][2]
    assert zai["quant"] == "fp8" and zai["cached"] == 0.3 and zai["official"] is True


def test_merge_providers_ignores_empty_response():
    model = {"providers": [{"name": "Keep", "in": 1.0}]}
    assert not refresh.merge_providers(model, [])
    assert model["providers"] == [{"name": "Keep", "in": 1.0}]
