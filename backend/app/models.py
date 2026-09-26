"""Database tables. Medical knowledge is NOT stored here — it lives in versioned
files under data/knowledge and is loaded by the engine.

FHIR mapping (for future integration):
  Profile            -> Patient
  HealthInfo         -> Condition (one per code)
  SafetyInfo         -> AllergyIntolerance + AdverseEvent
  VaccinationRecord  -> Immunization
  AssessmentRun      -> ImmunizationRecommendation (snapshot)
"""
import datetime as dt
from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

from sqlalchemy import JSON, Column
from sqlmodel import Field, SQLModel


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def new_id() -> str:
    return uuid4().hex


class User(SQLModel, table=True):
    id: str = Field(default_factory=new_id, primary_key=True)
    email: str = Field(index=True, unique=True)
    password_hash: str
    created_at: datetime = Field(default_factory=utcnow)
    onboarding_completed_at: Optional[datetime] = None


class Session(SQLModel, table=True):
    token_hash: str = Field(primary_key=True)
    user_id: str = Field(index=True, foreign_key="user.id")
    csrf_token: str
    created_at: datetime = Field(default_factory=utcnow)
    expires_at: datetime


class PasswordReset(SQLModel, table=True):
    token_hash: str = Field(primary_key=True)
    user_id: str = Field(foreign_key="user.id")
    expires_at: datetime
    used: bool = False


class Profile(SQLModel, table=True):
    user_id: str = Field(primary_key=True, foreign_key="user.id")
    full_name: str
    birth_date: dt.date
    sex_at_birth: str  # female | male | intersex | prefer_not
    pregnancy_status: str = "not_applicable"  # pregnant | not_pregnant | unsure | not_applicable
    pregnancy_weeks: Optional[int] = None
    updated_at: datetime = Field(default_factory=utcnow)


class Location(SQLModel, table=True):
    user_id: str = Field(primary_key=True, foreign_key="user.id")
    country_code: str  # US | IN | OTHER
    country_name: Optional[str] = None
    region: Optional[str] = None
    city: Optional[str] = None
    lat: Optional[float] = None  # rounded to ~1 km before storage
    lon: Optional[float] = None
    guideline_set_id: Optional[str] = None
    updated_at: datetime = Field(default_factory=utcnow)


class HealthInfo(SQLModel, table=True):
    user_id: str = Field(primary_key=True, foreign_key="user.id")
    conditions: dict = Field(default_factory=dict, sa_column=Column(JSON))  # code -> yes|no|unsure
    immunocompromised: str = "unsure"
    severe_immunodeficiency: str = "unsure"
    healthcare_personnel: str = "unsure"
    student_traveler_contact: str = "unsure"
    updated_at: datetime = Field(default_factory=utcnow)


class HistoryInfo(SQLModel, table=True):
    user_id: str = Field(primary_key=True, foreign_key="user.id")
    answers: dict = Field(default_factory=dict, sa_column=Column(JSON))  # vaccine -> received|not_received|unknown
    immunity: dict = Field(default_factory=dict, sa_column=Column(JSON))  # mmr|varicella -> yes|no|unsure
    updated_at: datetime = Field(default_factory=utcnow)


class VaccinationRecord(SQLModel, table=True):
    id: str = Field(default_factory=new_id, primary_key=True)
    user_id: str = Field(index=True, foreign_key="user.id")
    vaccine_id: str
    product: Optional[str] = None
    date: Optional[dt.date] = None
    date_precision: str = "day"  # day | month | year | unknown
    dose_number: Optional[int] = None
    provider_text: Optional[str] = None
    notes: Optional[str] = None
    data_status: str = "USER_REPORTED"  # USER_REPORTED | VERIFIED
    created_at: datetime = Field(default_factory=utcnow)


class SafetyInfo(SQLModel, table=True):
    user_id: str = Field(primary_key=True, foreign_key="user.id")
    allergy_triage: str = "unsure"
    allergies: list = Field(default_factory=list, sa_column=Column(JSON))
    reaction_triage: str = "unsure"
    reactions: list = Field(default_factory=list, sa_column=Column(JSON))
    answers: dict = Field(default_factory=dict, sa_column=Column(JSON))  # safety fact -> yes|no|unsure
    updated_at: datetime = Field(default_factory=utcnow)


class AssessmentRun(SQLModel, table=True):
    id: str = Field(default_factory=new_id, primary_key=True)
    user_id: str = Field(index=True, foreign_key="user.id")
    created_at: datetime = Field(default_factory=utcnow)
    trigger: str = "user"  # user | dose_recorded | profile_changed
    guideline_set_id: Optional[str] = None
    guideline_version: Optional[str] = None
    engine_version: str
    input_hash: str
    outcome: str
    result: dict = Field(default_factory=dict, sa_column=Column(JSON))


class Reminder(SQLModel, table=True):
    id: str = Field(default_factory=new_id, primary_key=True)
    user_id: str = Field(index=True, foreign_key="user.id")
    kind: str  # next_dose | due_now | review | custom
    vaccine_id: Optional[str] = None
    title: str
    detail: Optional[str] = None
    due_date: Optional[dt.date] = None
    origin: str = "schedule"  # schedule (generated) | user
    rule_id: Optional[str] = None
    status: str = "open"  # open | done | dismissed
    created_at: datetime = Field(default_factory=utcnow)


class SavedItem(SQLModel, table=True):
    id: str = Field(default_factory=new_id, primary_key=True)
    user_id: str = Field(index=True, foreign_key="user.id")
    kind: str  # vaccine | provider
    ref: str
    created_at: datetime = Field(default_factory=utcnow)


class AuditEvent(SQLModel, table=True):
    """What changed and when — field names only, never values."""
    id: str = Field(default_factory=new_id, primary_key=True)
    user_id: str = Field(index=True)
    at: datetime = Field(default_factory=utcnow)
    entity: str
    action: str
    fields: list = Field(default_factory=list, sa_column=Column(JSON))
