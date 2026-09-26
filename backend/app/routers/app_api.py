"""Catalog, knowledge, assessments, providers, reminders, saved items, activity, account."""
import json
from datetime import date
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel, Field
from sqlmodel import Session, select

from app.db import get_session
from app.models import (
    AssessmentRun, AuditEvent, HealthInfo, HistoryInfo, Location, PasswordReset, Profile, Reminder, SafetyInfo,
    SavedItem, User, VaccinationRecord,
)
from app.models import Session as SessionRow
from app.security import current_user, end_session, verify_password
from app.services import assessment, audit, intake, providers
from app.services.catalog import (
    ALLERGY_CATEGORIES, ALLERGY_SEVERITIES, ALLERGY_SUBSTANCES, JURISDICTIONS, PRODUCTS, REACTION_KINDS,
    SAFETY_FACTS,
)
from engine import CONDITIONS, load_all

router = APIRouter(prefix="/api/v1", tags=["app"])


# ---------- Catalog & knowledge (public) ----------

@router.get("/catalog")
def catalog():
    sets = load_all()
    return {
        "jurisdictions": [
            {**j, "guideline": sets[f"{'us-cdc-adult' if j['code'] == 'US' else 'in-uip'}"].summary()
             if j["code"] in ("US", "IN") else None}
            for j in JURISDICTIONS
        ],
        "conditions": [{"code": k, "label": v} for k, v in CONDITIONS.items()],
        "safetyQuestions": [{"code": k, "label": v} for k, v in SAFETY_FACTS.items()],
        "allergyCategories": list(ALLERGY_CATEGORIES),
        "allergySeverities": list(ALLERGY_SEVERITIES),
        "allergySubstances": [{"code": k, "label": v} for k, v in ALLERGY_SUBSTANCES.items()],
        "reactionKinds": [{"code": k, "label": v} for k, v in REACTION_KINDS.items()],
        "products": PRODUCTS,
        "vaccinesBySet": {
            sid: [{"id": v["id"], "name": v["name"], "shortName": v["short_name"],
                   "protectsAgainst": v["protects_against"]} for v in gs.vaccines.values()]
            for sid, gs in sets.items()
        },
    }


@router.get("/guidelines")
def guidelines():
    return [{**gs.summary(), "sources": gs.meta["sources"], "vaccines": [v["short_name"] for v in gs.vaccines.values()]}
            for gs in load_all().values()]


@router.get("/guidelines/{set_id}/vaccines/{vaccine_id}")
def vaccine_detail(set_id: str, vaccine_id: str):
    gs = load_all().get(set_id)
    if not gs or vaccine_id not in gs.vaccines:
        raise HTTPException(404, "We don't have information about this vaccine for your guideline.")
    v = gs.vaccines[vaccine_id]
    rules = lambda items: [{k: r.get(k) for k in ("id", "status", "reason", "text", "kind", "source", "section")}  # noqa: E731
                           for r in items]
    used = set(v["content"].get("sources", []))
    for r in v["indications"] + v.get("contraindications", []) + v.get("precautions", []):
        used.add(r["source"])
    return {
        "guideline": gs.summary(),
        "vaccine": {
            "id": v["id"], "name": v["name"], "shortName": v["short_name"], "protectsAgainst": v["protects_against"],
            "live": v.get("live", False), "content": v["content"], "series": v["series"],
            "indications": rules(v["indications"]), "contraindications": rules(v.get("contraindications", [])),
            "precautions": rules(v.get("precautions", [])), "safetyNote": v.get("safety_note"),
            "notIndicatedReason": v.get("not_indicated_reason"),
        },
        "sources": [s for s in gs.meta["sources"] if s["id"] in used],
    }


# ---------- Assessments ----------

def _run_out(r: AssessmentRun) -> dict:
    return {"id": r.id, "createdAt": r.created_at.isoformat(), "trigger": r.trigger, "outcome": r.outcome,
            "guidelineSetId": r.guideline_set_id, "guidelineVersion": r.guideline_version,
            "engineVersion": r.engine_version, "result": r.result}


@router.post("/assessments", status_code=201)
def run_assessment(user: User = Depends(current_user), db: Session = Depends(get_session)):
    if not user.onboarding_completed_at:
        raise HTTPException(409, "Finish and review your information before running an assessment.")
    return _run_out(assessment.run(db, user, "user"))


@router.get("/assessments/latest")
def latest_assessment(user: User = Depends(current_user), db: Session = Depends(get_session)):
    r = assessment.latest(db, user)
    return _run_out(r) if r else None


@router.get("/assessments")
def list_assessments(user: User = Depends(current_user), db: Session = Depends(get_session)):
    rows = db.exec(select(AssessmentRun).where(AssessmentRun.user_id == user.id)
                   .order_by(AssessmentRun.created_at.desc())).all()
    return [{k: v for k, v in _run_out(r).items() if k != "result"} | {"counts": r.result.get("counts")} for r in rows]


@router.get("/assessments/{run_id}")
def get_assessment(run_id: str, user: User = Depends(current_user), db: Session = Depends(get_session)):
    r = db.get(AssessmentRun, run_id)
    if not r or r.user_id != user.id:
        raise HTTPException(404, "Assessment not found.")
    return _run_out(r)


# ---------- Providers ----------

def _origin(db: Session, user: User):
    loc = db.get(Location, user.id)
    origin = (loc.lat, loc.lon) if loc and loc.lat is not None else None
    return loc, origin


@router.get("/providers")
def list_providers(vaccine: Optional[str] = None, user: User = Depends(current_user), db: Session = Depends(get_session)):
    loc, origin = _origin(db, user)
    res = providers.search(loc.country_code if loc else None, vaccine, origin)
    return {**res, "hasLocation": origin is not None}


@router.get("/providers/{provider_id}")
def get_provider(provider_id: str, user: User = Depends(current_user), db: Session = Depends(get_session)):
    loc, origin = _origin(db, user)
    p = providers.get(provider_id, origin)
    if not p or (loc and p["jurisdiction"] != loc.country_code):
        raise HTTPException(404, "Provider not found.")
    return p


# ---------- Reminders ----------

class ReminderIn(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    detail: Optional[str] = Field(default=None, max_length=300)
    due_date: date
    vaccine_id: Optional[str] = None


class ReminderPatch(BaseModel):
    status: Literal["open", "done", "dismissed"]


def _reminder_out(r: Reminder) -> dict:
    return {"id": r.id, "kind": r.kind, "vaccineId": r.vaccine_id, "title": r.title, "detail": r.detail,
            "dueDate": r.due_date.isoformat() if r.due_date else None, "origin": r.origin, "ruleId": r.rule_id,
            "status": r.status, "createdAt": r.created_at.isoformat()}


@router.get("/reminders")
def list_reminders(user: User = Depends(current_user), db: Session = Depends(get_session)):
    rows = db.exec(select(Reminder).where(Reminder.user_id == user.id)).all()
    rows.sort(key=lambda r: (r.status != "open", r.due_date is None, r.due_date or date.max))
    return [_reminder_out(r) for r in rows]


@router.post("/reminders", status_code=201)
def add_reminder(body: ReminderIn, user: User = Depends(current_user), db: Session = Depends(get_session)):
    r = Reminder(user_id=user.id, kind="custom", origin="user", **body.model_dump())
    db.add(r)
    audit.record(db, user.id, "reminder", "added")
    db.commit()
    db.refresh(r)
    return _reminder_out(r)


@router.patch("/reminders/{rid}")
def update_reminder(rid: str, body: ReminderPatch, user: User = Depends(current_user), db: Session = Depends(get_session)):
    r = db.get(Reminder, rid)
    if not r or r.user_id != user.id:
        raise HTTPException(404, "Reminder not found.")
    r.status = body.status
    db.add(r)
    audit.record(db, user.id, "reminder", body.status)
    db.commit()
    return _reminder_out(r)


# ---------- Saved items ----------

class SavedIn(BaseModel):
    kind: Literal["vaccine", "provider"]
    ref: str = Field(min_length=1, max_length=80)


@router.get("/saved")
def list_saved(user: User = Depends(current_user), db: Session = Depends(get_session)):
    return [{"id": s.id, "kind": s.kind, "ref": s.ref, "createdAt": s.created_at.isoformat()}
            for s in db.exec(select(SavedItem).where(SavedItem.user_id == user.id)).all()]


@router.post("/saved", status_code=201)
def save_item(body: SavedIn, user: User = Depends(current_user), db: Session = Depends(get_session)):
    existing = db.exec(select(SavedItem).where(SavedItem.user_id == user.id, SavedItem.kind == body.kind,
                                               SavedItem.ref == body.ref)).first()
    if existing:
        return {"id": existing.id, "kind": existing.kind, "ref": existing.ref}
    s = SavedItem(user_id=user.id, **body.model_dump())
    db.add(s)
    audit.record(db, user.id, f"saved_{body.kind}", "added")
    db.commit()
    return {"id": s.id, "kind": s.kind, "ref": s.ref}


@router.delete("/saved/{sid}")
def unsave_item(sid: str, user: User = Depends(current_user), db: Session = Depends(get_session)):
    s = db.get(SavedItem, sid)
    if not s or s.user_id != user.id:
        raise HTTPException(404, "Not found.")
    db.delete(s)
    audit.record(db, user.id, f"saved_{s.kind}", "removed")
    db.commit()
    return {"deleted": True}


# ---------- Activity ----------

@router.get("/activity")
def activity(user: User = Depends(current_user), db: Session = Depends(get_session)):
    rows = db.exec(select(AuditEvent).where(AuditEvent.user_id == user.id)
                   .order_by(AuditEvent.at.desc()).limit(100)).all()
    return [{"id": e.id, "at": e.at.isoformat(), "entity": e.entity, "action": e.action, "fields": e.fields}
            for e in rows]


# ---------- Account: export and delete ----------

class DeleteIn(BaseModel):
    password: str = Field(min_length=1, max_length=200)


@router.get("/account/export")
def export(user: User = Depends(current_user), db: Session = Depends(get_session)):
    from app.routers.intake import serialize

    data = serialize(intake.load(db, user))
    runs = db.exec(select(AssessmentRun).where(AssessmentRun.user_id == user.id)).all()
    payload = {
        "exportedAt": date.today().isoformat(), "account": {"email": user.email, "createdAt": user.created_at.isoformat()},
        **data,
        "assessments": [_run_out(r) for r in runs],
        "reminders": [_reminder_out(r) for r in db.exec(select(Reminder).where(Reminder.user_id == user.id)).all()],
    }
    return Response(json.dumps(payload, indent=2, default=str), media_type="application/json",
                    headers={"Content-Disposition": 'attachment; filename="my-vaccination-data.json"'})


@router.post("/account/delete")
def delete_account(body: DeleteIn, request: Request, response: Response, user: User = Depends(current_user),
                   db: Session = Depends(get_session)):
    if not verify_password(body.password, user.password_hash):
        raise HTTPException(403, "That password isn't correct.")
    end_session(db, request, response)
    for model in (Profile, Location, HealthInfo, HistoryInfo, SafetyInfo):
        row = db.get(model, user.id)
        if row:
            db.delete(row)
    for model in (VaccinationRecord, AssessmentRun, Reminder, SavedItem, AuditEvent, SessionRow, PasswordReset):
        for row in db.exec(select(model).where(model.user_id == user.id)).all():
            db.delete(row)
    db.delete(user)
    db.commit()
    return {"deleted": True}
