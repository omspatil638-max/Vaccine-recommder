"""Provider discovery.

Only DEMO data exists. Every record is returned with data_origin="DEMO". When
demo mode is off, the service returns no providers and an explicit
DATA_UNAVAILABLE state — it never falls back to invented records.
"""
from __future__ import annotations

import json
import math
from functools import lru_cache
from typing import Optional

from app.config import DEMO_DATA_DIR, DEMO_MODE

AVAILABILITY_STATES = ("AVAILABLE", "LIMITED", "UNAVAILABLE", "NOT_VERIFIED", "DATA_UNAVAILABLE")


@lru_cache(maxsize=1)
def _demo() -> dict:
    return json.loads((DEMO_DATA_DIR / "providers.json").read_text(encoding="utf-8"))


def _offset(lat: float, lon: float, dx_km: float, dy_km: float) -> tuple[float, float]:
    dlat = dy_km / 111.32
    dlon = dx_km / (111.32 * max(math.cos(math.radians(lat)), 0.01))
    return round(lat + dlat, 5), round(lon + dlon, 5)


def _present(p: dict, origin: Optional[tuple[float, float]]) -> dict:
    out = {k: v for k, v in p.items() if k not in ("offset_km",)}
    out["dataOrigin"] = "DEMO"
    out["source"] = "Demo dataset (simulated)"
    if origin:
        dx, dy = p["offset_km"]
        out["lat"], out["lon"] = _offset(origin[0], origin[1], dx, dy)
        out["distanceKm"] = round(math.hypot(dx, dy), 1)
        out["address"] = "Demo location — not a real address"
    else:
        out["lat"] = out["lon"] = out["distanceKm"] = None
        out["address"] = "Demo location — not a real address"
    for s in out["services"]:
        s.setdefault("source", "Demo dataset (simulated)")
        if s.get("price"):
            price = s["price"]
            price["total"] = round(price["vaccine"] + price["admin_fee"], 2)
    return out


def search(jurisdiction: Optional[str], vaccine_id: Optional[str], origin: Optional[tuple[float, float]]) -> dict:
    if not DEMO_MODE:
        return {"dataOrigin": "NONE", "state": "DATA_UNAVAILABLE", "providers": [],
                "notice": "No verified provider data source is connected, so we can't show vaccination providers."}
    demo = _demo()
    items = [p for p in demo["providers"] if p["jurisdiction"] == jurisdiction]
    if vaccine_id:
        items = [p for p in items if any(s["vaccine_id"] == vaccine_id for s in p["services"])]
    shaped = [_present(json.loads(json.dumps(p)), origin) for p in items]
    shaped.sort(key=lambda p: (p["distanceKm"] is None, p["distanceKm"] or 0, p["name"]))
    state = "DEMO" if shaped else "NONE_FOUND"
    return {"dataOrigin": "DEMO", "state": state, "providers": shaped, "notice": demo["notice"],
            "generated": demo["last_generated"]}


def get(provider_id: str, origin: Optional[tuple[float, float]]) -> Optional[dict]:
    if not DEMO_MODE:
        return None
    for p in _demo()["providers"]:
        if p["id"] == provider_id:
            return {**_present(json.loads(json.dumps(p)), origin), "notice": _demo()["notice"]}
    return None
