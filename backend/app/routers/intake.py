"""Intake wizard endpoints: one resource per step, each validated strictly."""
import datetime as dt
from datetime import date, datetime, timezone
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator, model_validator
from sqlmodel import Session

from app.db import get_session
from app.models import HealthInfo, HistoryInfo, Location, Profile, SafetyInfo, User, VaccinationRecord, utcnow
from app.security import current_user
from app.services import assessment, audit, intake
from app.services.catalog import (
    ALLERGY_CATEGORIES, ALLERGY_SEVERITIES, ALLERGY_SUBSTANCES, IN_REGIONS, PRODUCTS, REACTION_KINDS,
    SAFETY_FACTS, US_REGIONS,
)
from engine import CONDITIONS, load_all, set_for_jurisdiction

router = APIRouter(prefix="/api/v1/intake", tags=["intake"])

Tri = Literal["yes", "no", "unsure"]
ALL_VACCINES = {vid for gs in load_all().values() for vid in gs.vaccines}


# ---------- Schemas ----------

class ProfileIn(BaseModel):
    full_name: str = Field(min_length=1, max_length=100)
    birth_date: date
    sex_at_birth: Literal["female", "male", "intersex", "prefer_not"]
    pregnancy_status: Literal["pregnant", "not_pregnant", "unsure", "not_applicable"] = "not_applicable"
    pregnancy_weeks: Optional[int] = Field(default=None, ge=1, le=42)

    @field_validator("full_name")
    @classmethod
    def strip_name(cls, v: str) -> str:
        v = " ".join(v.split())
        if not v:
            raise ValueError("Enter your name.")
        return v

    @field_validator("birth_date")
    @classmethod
    def adult(cls, v: date) -> date:
        today = date.today()
        age = today.year - v.year - ((today.month, today.day) < (v.month, v.day))
        if v > today:
            raise ValueError("Date of birth can't be in the future.")
        if age < 18:
            raise ValueError("This service is for adults aged 18 and over.")
        if age > 120:
            raise ValueError("Check the year of birth.")
        return v

    @model_validator(mode="after")
    def pregnancy_consistency(self):
        if self.sex_at_birth == "male":
            self.pregnancy_status, self.pregnancy_weeks = "not_applicable", None
        elif self.pregnancy_status == "not_applicable":
            raise ValueError("Tell us whether you're pregnant, or choose 'Not sure'.")
        if self.pregnancy_status != "pregnant":
            self.pregnancy_weeks = None
        return self


class LocationIn(BaseModel):
    country_code: Literal["US", "IN", "OTHER"]
    country_name: Optional[str] = Field(default=None, max_length=80)
    region: Optional[str] = Field(default=None, max_length=80)
    city: Optional[str] = Field(default=None, max_length=100)
    lat: Optional[float] = Field(default=None, ge=-90, le=90)
    lon: Optional[float] = Field(default=None, ge=-180, le=180)

    @model_validator(mode="after")
    def check(self):
        regions = {"US": US_REGIONS, "IN": IN_REGIONS}.get(self.country_code)
        if regions is not None and self.region and self.region not in regions:
            raise ValueError("Choose a state or region from the list.")
        if self.country_code == "OTHER" and not (self.country_name or "").strip():
            raise ValueError("Tell us which country you live in.")
        if (self.lat is None) != (self.lon is None):
            raise ValueError("Location needs both latitude and longitude.")
        # Store only ~1 km precision.
        if self.lat is not None:
            self.lat, self.lon = round(self.lat, 2), round(self.lon, 2)
        return self


class HealthIn(BaseModel):
    conditions: dict[str, Tri]
    immunocompromised: Tri
    severe_immunodeficiency: Tri = "unsure"
    healthcare_personnel: Tri
    student_traveler_contact: Tri = "unsure"

    @field_validator("conditions")
    @classmethod
    def known_conditions(cls, v: dict) -> dict:
        unknown = set(v) - set(CONDITIONS)
        if unknown:
            raise ValueError(f"Unknown conditions: {sorted(unknown)}")
        missing = set(CONDITIONS) - set(v)
        if missing:
            raise ValueError("Answer every condition, choosing 'Not sure' if you don't know.")
        return v

    @model_validator(mode="after")
    def severity(self):
        if self.immunocompromised == "no":
            self.severe_immunodeficiency = "no"
        return self


class HistoryIn(BaseModel):
    answers: dict[str, Literal["received", "not_received", "unknown"]]
    immunity: dict[Literal["mmr", "varicella"], Tri] = Field(default_factory=dict)

    @field_validator("answers")
    @classmethod
    def known(cls, v: dict) -> dict:
        if set(v) - ALL_VACCINES:
            raise ValueError("Unknown vaccine in history.")
        return v


class RecordIn(BaseModel):
    vaccine_id: str
    product: Optional[str] = None
    date: Optional[dt.date] = None
    date_precision: Literal["day", "month", "year", "unknown"] = "day"
    dose_number: Optional[int] = Field(default=None, ge=1, le=10)
    provider_text: Optional[str] = Field(default=None, max_length=120)
    notes: Optional[str] = Field(default=None, max_length=300)

    @model_validator(mode="after")
    def check(self):
        if self.vaccine_id not in ALL_VACCINES:
            raise ValueError("Choose a vaccine from the list.")
        products = PRODUCTS.get(self.vaccine_id)
        if self.product and (not products or self.product not in products):
            raise ValueError("Choose a product from the list.")
        if self.date_precision == "unknown":
            self.date = None
        elif self.date is None:
            raise ValueError("Enter the date, or choose 'I don't know the date'.")
        elif self.date > date.today():
            raise ValueError("The date can't be in the future.")
        return self


class AllergyIn(BaseModel):
    category: Literal[ALLERGY_CATEGORIES]  # type: ignore[valid-type]
    substance: str
    substance_other: Optional[str] = Field(default=None, max_length=80)
    severity: Literal[ALLERGY_SEVERITIES]  # type: ignore[valid-type]

    @field_validator("substance")
    @classmethod
    def known_substance(cls, v: str) -> str:
        if v not in ALLERGY_SUBSTANCES:
            raise ValueError("Choose what you're allergic to from the list, or 'Something else'.")
        return v


class ReactionIn(BaseModel):
    vaccine_id: str
    kind: Literal[tuple(REACTION_KINDS)]  # type: ignore[valid-type]
    note: Optional[str] = Field(default=None, max_length=200)

    @field_validator("vaccine_id")
    @classmethod
    def known_vaccine(cls, v: str) -> str:
        if v != "unknown" and v not in ALL_VACCINES:
            raise ValueError("Choose a vaccine from the list, or 'Not sure which vaccine'.")
        return v


class SafetyIn(BaseModel):
    allergy_triage: Tri
    allergies: list[AllergyIn] = Field(default_factory=list, max_length=20)
    reaction_triage: Tri
    reactions: list[ReactionIn] = Field(default_factory=list, max_length=20)
    answers: dict[str, Tri]

    @model_validator(mode="after")
    def check(self):
        if set(self.answers) - set(SAFETY_FACTS):
            raise ValueError("Unknown safety question.")
        if set(SAFETY_FACTS) - set(self.answers):
            raise ValueError("Answer every safety question, choosing 'Not sure' if you don't know.")
        if self.allergy_triage == "yes" and not self.allergies:
            raise ValueError("Add at least one allergy, or change your answer to 'Not sure'.")
        if self.reaction_triage == "yes" and not self.reactions:
            raise ValueError("Add the reaction you had, or change your answer to 'Not sure'.")
        if self.allergy_triage != "yes":
            self.allergies = []
        if self.reaction_triage != "yes":
            self.reactions = []
        return self


# ---------- Helpers ----------

def _changed(old, new: dict) -> list[str]:
    if old is None:
        return sorted(new)
    return sorted(k for k, v in new.items() if getattr(old, k, None) != v)


def _upsert(db: Session, model, user: User, values: dict, entity: str):
    row = db.get(model, user.id)
    changed = _changed(row, values)
    if row is None:
        row = model(user_id=user.id, **values)
    else:
        for k, v in values.items():
            setattr(row, k, v)
    row.updated_at = utcnow()
    db.add(row)
    if changed:
        audit.record(db, user.id, entity, "updated", changed)
    db.commit()
    return row


def _response(db: Session, user: User) -> dict:
    data = intake.load(db, user)
    return {"progress": intake.progress(user, data)}


def serialize(data: dict) -> dict:
    def dump(row):
        if row is None:
            return None
        return {k: (v.isoformat() if hasattr(v, "isoformat") else v)
                for k, v in row.model_dump().items() if k not in ("user_id",)}

    loc = data["location"]
    gs = set_for_jurisdiction(loc.country_code) if loc else None
    return {
        "profile": dump(data["profile"]),
        "location": dump(data["location"]),
        "health": dump(data["health"]),
        "history": dump(data["history"]),
        "safety": dump(data["safety"]),
        "records": [dump(r) for r in data["records"]],
        "guideline": gs.summary() if gs else None,
    }


# ---------- Endpoints ----------

@router.get("")
def get_intake(user: User = Depends(current_user), db: Session = Depends(get_session)):
    data = intake.load(db, user)
    return {**serialize(data), "progress": intake.progress(user, data)}


@router.put("/profile")
def put_profile(body: ProfileIn, user: User = Depends(current_user), db: Session = Depends(get_session)):
    _upsert(db, Profile, user, body.model_dump(), "profile")
    return _response(db, user)


@router.put("/location")
def put_location(body: LocationIn, user: User = Depends(current_user), db: Session = Depends(get_session)):
    values = body.model_dump()
    if body.country_code != "OTHER":
        values["country_name"] = {"US": "United States", "IN": "India"}[body.country_code]
    gs = set_for_jurisdiction(body.country_code)
    values["guideline_set_id"] = gs.id if gs else None
    _upsert(db, Location, user, values, "location")
    return {**_response(db, user), "guideline": gs.summary() if gs else None}


@router.put("/health")
def put_health(body: HealthIn, user: User = Depends(current_user), db: Session = Depends(get_session)):
    _upsert(db, HealthInfo, user, body.model_dump(), "health")
    return _response(db, user)


@router.put("/history")
def put_history(body: HistoryIn, user: User = Depends(current_user), db: Session = Depends(get_session)):
    _upsert(db, HistoryInfo, user, body.model_dump(), "vaccination_history")
    return _response(db, user)


@router.put("/safety")
def put_safety(body: SafetyIn, user: User = Depends(current_user), db: Session = Depends(get_session)):
    values = body.model_dump()
    _upsert(db, SafetyInfo, user, values, "safety")
    return _response(db, user)


def _record_out(r: VaccinationRecord) -> dict:
    return {k: (v.isoformat() if hasattr(v, "isoformat") else v) for k, v in r.model_dump().items() if k != "user_id"}


def _reassess_if_onboarded(db: Session, user: User, trigger: str) -> Optional[str]:
    if user.onboarding_completed_at:
        return assessment.run(db, user, trigger).id
    return None


@router.post("/records", status_code=201)
def add_record(body: RecordIn, user: User = Depends(current_user), db: Session = Depends(get_session)):
    if body.date and (p := db.get(Profile, user.id)) and body.date < p.birth_date:
        raise HTTPException(422, "The date is before your date of birth.")
    row = VaccinationRecord(user_id=user.id, **body.model_dump())
    db.add(row)
    # A recorded dose means the person has had this vaccine.
    hist = db.get(HistoryInfo, user.id)
    if hist and hist.answers.get(body.vaccine_id) != "received":
        hist.answers = {**hist.answers, body.vaccine_id: "received"}
        db.add(hist)
    audit.record(db, user.id, "vaccination_record", "added", ["vaccine_id", "date"])
    db.commit()
    db.refresh(row)
    out = _record_out(row)  # before re-assessing, which expires loaded rows
    run_id = _reassess_if_onboarded(db, user, "dose_recorded")
    return {"record": out, "assessmentId": run_id}


@router.patch("/records/{record_id}")
def edit_record(record_id: str, body: RecordIn, user: User = Depends(current_user), db: Session = Depends(get_session)):
    row = db.get(VaccinationRecord, record_id)
    if not row or row.user_id != user.id:
        raise HTTPException(404, "Record not found.")
    changed = _changed(row, body.model_dump())
    for k, v in body.model_dump().items():
        setattr(row, k, v)
    db.add(row)
    audit.record(db, user.id, "vaccination_record", "edited", changed)
    db.commit()
    db.refresh(row)
    out = _record_out(row)
    run_id = _reassess_if_onboarded(db, user, "dose_recorded")
    return {"record": out, "assessmentId": run_id}


@router.delete("/records/{record_id}")
def delete_record(record_id: str, user: User = Depends(current_user), db: Session = Depends(get_session)):
    row = db.get(VaccinationRecord, record_id)
    if not row or row.user_id != user.id:
        raise HTTPException(404, "Record not found.")
    db.delete(row)
    audit.record(db, user.id, "vaccination_record", "deleted")
    db.commit()
    run_id = _reassess_if_onboarded(db, user, "dose_recorded")
    return {"deleted": True, "assessmentId": run_id}


@router.get("/records/{record_id}")
def get_record(record_id: str, user: User = Depends(current_user), db: Session = Depends(get_session)):
    row = db.get(VaccinationRecord, record_id)
    if not row or row.user_id != user.id:
        raise HTTPException(404, "Record not found.")
    return {"record": _record_out(row)}


@router.post("/complete")
def complete(user: User = Depends(current_user), db: Session = Depends(get_session)):
    data = intake.load(db, user)
    prog = intake.progress(user, data)
    missing = [s for s in intake.STEPS[:-1] if s not in prog["completed"]]
    if missing:
        raise HTTPException(409, f"Finish these steps first: {', '.join(missing)}.")
    if not user.onboarding_completed_at:
        user.onboarding_completed_at = datetime.now(timezone.utc)
        db.add(user)
        audit.record(db, user.id, "onboarding", "completed")
        db.commit()
    run = assessment.run(db, user, "user")
    return {"assessmentId": run.id, "progress": intake.progress(user, intake.load(db, user))}
