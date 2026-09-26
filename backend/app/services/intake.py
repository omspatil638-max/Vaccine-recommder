"""Reading intake data, onboarding progress, and converting it to engine facts."""
from __future__ import annotations

from datetime import date
from typing import Optional

from sqlmodel import Session, select

from app.models import HealthInfo, HistoryInfo, Location, Profile, SafetyInfo, User, VaccinationRecord
from engine import Allergy, DoseRecord, Facts, Reaction

STEPS = ["profile", "location", "health", "history", "safety", "review"]

TRI_MAP = {"yes": True, "no": False, "unsure": None}


def tri(value: Optional[str]) -> Optional[bool]:
    return TRI_MAP.get(value or "unsure")


def load(db: Session, user: User) -> dict:
    uid = user.id
    records = db.exec(
        select(VaccinationRecord).where(VaccinationRecord.user_id == uid).order_by(VaccinationRecord.date)
    ).all()
    return {
        "profile": db.get(Profile, uid),
        "location": db.get(Location, uid),
        "health": db.get(HealthInfo, uid),
        "history": db.get(HistoryInfo, uid),
        "safety": db.get(SafetyInfo, uid),
        "records": records,
    }


def progress(user: User, data: dict) -> dict:
    done = {step: data.get(step) is not None for step in STEPS[:-1]}
    done["review"] = user.onboarding_completed_at is not None
    next_step = next((s for s in STEPS if not done[s]), None)
    return {"completed": [s for s in STEPS if done[s]], "nextStep": next_step,
            "onboardingComplete": done["review"]}


def to_facts(data: dict, today: Optional[date] = None) -> Facts:
    today = today or date.today()
    p: Optional[Profile] = data["profile"]
    h: Optional[HealthInfo] = data["health"]
    hist: Optional[HistoryInfo] = data["history"]
    s: Optional[SafetyInfo] = data["safety"]

    pregnant: Optional[bool] = None
    weeks = None
    if p:
        pregnant = {"pregnant": True, "not_pregnant": False, "not_applicable": False}.get(p.pregnancy_status)
        weeks = p.pregnancy_weeks if pregnant else None

    records = []
    for r in data["records"]:
        usable_date = r.date if r.date_precision in ("day", "month") else None
        records.append(DoseRecord(r.vaccine_id, usable_date, r.product, r.id))

    return Facts(
        today=today,
        birth_date=p.birth_date if p else None,
        pregnant=pregnant,
        pregnancy_weeks=weeks,
        healthcare_personnel=tri(h.healthcare_personnel) if h else None,
        student_traveler_contact=tri(h.student_traveler_contact) if h else None,
        immunocompromised=tri(h.immunocompromised) if h else None,
        severe_immunodeficiency=(
            False if h and h.immunocompromised == "no" else tri(h.severe_immunodeficiency) if h else None
        ),
        conditions={k: tri(v) for k, v in (h.conditions if h else {}).items()},
        immunity={k: tri(v) for k, v in (hist.immunity if hist else {}).items()},
        history=dict(hist.answers) if hist else {},
        records=records,
        allergy_triage=s.allergy_triage if s else None,
        allergies=[Allergy(a["substance"], a.get("category", "other"), a.get("severity", "unknown"))
                   for a in (s.allergies if s else [])],
        reaction_triage=s.reaction_triage if s else None,
        reactions=[Reaction(r["vaccine_id"], r.get("kind", "unsure")) for r in (s.reactions if s else [])],
        safety={k: tri(v) for k, v in (s.answers if s else {}).items()},
    )
