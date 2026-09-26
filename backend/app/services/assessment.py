"""Run the engine for a user, store an immutable snapshot, refresh reminders."""
from __future__ import annotations

import hashlib
import json
from dataclasses import asdict
from datetime import date

from sqlmodel import Session, select

from app.models import AssessmentRun, Reminder, User
from app.services import audit, intake
from engine import ENGINE_VERSION, assess, set_for_jurisdiction


def _hash(facts) -> str:
    payload = json.dumps(asdict(facts), default=str, sort_keys=True)
    return hashlib.sha256(payload.encode()).hexdigest()


def run(db: Session, user: User, trigger: str = "user", today: date | None = None) -> AssessmentRun:
    data = intake.load(db, user)
    facts = intake.to_facts(data, today)
    loc = data["location"]
    gs = set_for_jurisdiction(loc.country_code if loc else None)
    result = assess(facts, gs)
    row = AssessmentRun(
        user_id=user.id, trigger=trigger, guideline_set_id=gs.id if gs else None,
        guideline_version=gs.meta["version"] if gs else None, engine_version=ENGINE_VERSION,
        input_hash=_hash(facts), outcome=result["outcome"], result=result,
    )
    db.add(row)
    audit.record(db, user.id, "assessment", "run", [trigger])
    refresh_reminders(db, user, result)
    db.commit()
    db.refresh(row)
    return row


def latest(db: Session, user: User) -> AssessmentRun | None:
    return db.exec(
        select(AssessmentRun).where(AssessmentRun.user_id == user.id).order_by(AssessmentRun.created_at.desc())
    ).first()


def refresh_reminders(db: Session, user: User, result: dict) -> None:
    """Replace open schedule-generated reminders with ones derived from this result.

    Reminders come only from structured timing data; the user's own reminders
    and anything they marked done or dismissed are left alone.
    """
    existing = db.exec(select(Reminder).where(Reminder.user_id == user.id, Reminder.origin == "schedule")).all()
    closed = {(r.vaccine_id, r.kind, r.due_date) for r in existing if r.status != "open"}
    for r in existing:
        if r.status == "open":
            db.delete(r)

    today = date.today()
    for res in result.get("results", []):
        timing = res.get("timing") or {}
        vid, name = res["vaccineId"], res["shortName"]
        rule_id = res["ruleIds"][0] if res.get("ruleIds") else None
        candidate = None
        if res["status"] in ("RECOMMENDED", "MAY_BE_APPROPRIATE") and timing:
            dose = timing.get("nextDose")
            dose_txt = f"dose {dose} of {timing['dosesRequired']}" if timing.get("dosesRequired", 1) > 1 and dose else "a dose"
            if timing.get("dueNow"):
                candidate = ("due_now", f"{name}: {dose_txt} is due", "You can get this now.", today)
            elif timing.get("earliestDate"):
                due = date.fromisoformat(timing.get("recommendedDate") or timing["earliestDate"])
                candidate = ("next_dose", f"{name}: {dose_txt}",
                             f"Earliest date: {timing['earliestDate']}.", due)
        elif res["status"] == "UP_TO_DATE" and timing.get("recommendedDate"):
            due = date.fromisoformat(timing["recommendedDate"])
            candidate = ("next_dose", f"{name}: next booster", "Based on your last recorded dose.", due)
        elif res["status"] == "REVIEW_WITH_PROFESSIONAL":
            candidate = ("review", f"Talk to a healthcare professional about {name}",
                         "Something in your answers needs a professional's check first.", None)
        if candidate and (vid, candidate[0], candidate[3]) not in closed:
            kind, title, detail, due = candidate
            db.add(Reminder(user_id=user.id, kind=kind, vaccine_id=vid, title=title, detail=detail,
                            due_date=due, origin="schedule", rule_id=rule_id))
