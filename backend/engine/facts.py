"""Engine input: normalised facts about one person on one date.

Every yes/no fact is three-valued: True, False, or None (unknown). Unknown is
never silently converted to False.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date
from typing import Literal, Optional

Tri = Optional[bool]
HistoryAnswer = Literal["received", "not_received", "unknown"]

# Conditions the health step asks about. Labels are shown to users.
CONDITIONS: dict[str, str] = {
    "chronic_heart_disease": "Long-term heart disease",
    "chronic_lung_disease": "Long-term lung disease, including asthma or COPD",
    "chronic_liver_disease": "Long-term liver disease",
    "chronic_kidney_disease": "Long-term kidney disease or dialysis",
    "diabetes": "Diabetes",
    "asplenia": "No spleen, or a spleen that doesn't work",
    "sickle_cell": "Sickle cell disease",
    "hiv": "HIV",
    "cochlear_implant": "Cochlear implant",
    "smoker": "Smoking cigarettes",
}

# Substances that might be vaccine ingredients. A severe allergy to one of these
# is sent for professional review unless the rule names it as a known component.
POSSIBLE_VACCINE_INGREDIENTS = {"yeast", "gelatin", "neomycin", "polysorbate", "egg", "latex"}

# Vaccine families for matching previous reactions.
FAMILY = {"td": "tetanus", "tdap": "tetanus"}

FACT_LABELS: dict[str, str] = {
    "age_years": "Your date of birth",
    "birth_year": "Your date of birth",
    "pregnant": "Whether you're pregnant",
    "pregnancy_weeks": "How many weeks pregnant you are",
    "healthcare_personnel": "Whether you work in healthcare",
    "student_traveler_contact": "Whether you're a student, a traveller, or a close contact of someone with a weakened immune system",
    "immunocompromised": "Whether you have a weakened immune system",
    "severe_immunodeficiency": "Whether your immune system is severely weakened",
    "immunity_mmr": "Whether you've been told you're immune to measles, mumps and rubella",
    "immunity_varicella": "Whether you've had chickenpox or shingles diagnosed",
    "current_illness": "Whether you're currently unwell",
    "current_shingles": "Whether you have shingles right now",
    "recent_blood_product": "Whether you've had a blood product in the last 11 months",
    "thrombocytopenia": "Whether you've had a low platelet count",
    "antivirals_24h": "Whether you're taking herpes antiviral medicine",
    "neuro_unstable": "Whether you have an unstable neurological condition",
    "family_immunodeficiency": "Whether immune problems run in your family",
    "allergies": "Your allergy information",
    "reactions": "Your past vaccine reactions",
    "history": "Records of your previous doses",
}


def condition_label(code: str) -> str:
    return f"Whether you have: {CONDITIONS.get(code, code).lower()}"


@dataclass
class DoseRecord:
    vaccine_id: str
    date: Optional[date] = None
    product: Optional[str] = None  # e.g. "tdap", "td", "pcv20"
    record_id: Optional[str] = None


@dataclass
class Allergy:
    substance: str  # code such as "yeast", "peanut", or "other"
    category: str = "other"  # food | medication | vaccine_ingredient | environment | other
    severity: Literal["anaphylaxis", "non_severe", "unknown"] = "unknown"


@dataclass
class Reaction:
    vaccine_id: str  # a vaccine id, or "unknown"
    kind: Literal[
        "anaphylaxis", "gbs_6_weeks", "encephalopathy_7_days", "arthus", "fainting", "other", "unsure"
    ] = "unsure"


@dataclass
class Facts:
    today: date
    birth_date: Optional[date] = None
    pregnant: Tri = None
    pregnancy_weeks: Optional[int] = None
    healthcare_personnel: Tri = None
    student_traveler_contact: Tri = None
    immunocompromised: Tri = None
    severe_immunodeficiency: Tri = None
    conditions: dict[str, Tri] = field(default_factory=dict)
    immunity: dict[str, Tri] = field(default_factory=dict)  # "mmr", "varicella"
    history: dict[str, HistoryAnswer] = field(default_factory=dict)
    records: list[DoseRecord] = field(default_factory=list)
    allergy_triage: Optional[Literal["yes", "no", "unsure"]] = None
    allergies: list[Allergy] = field(default_factory=list)
    reaction_triage: Optional[Literal["yes", "no", "unsure"]] = None
    reactions: list[Reaction] = field(default_factory=list)
    safety: dict[str, Tri] = field(default_factory=dict)

    @property
    def age_years(self) -> Optional[float]:
        if not self.birth_date:
            return None
        years = self.today.year - self.birth_date.year
        if (self.today.month, self.today.day) < (self.birth_date.month, self.birth_date.day):
            years -= 1
        return years

    @property
    def birth_year(self) -> Optional[int]:
        return self.birth_date.year if self.birth_date else None

    def get(self, name: str):
        """Value of a named scalar fact, or None when unknown."""
        if name == "age_years":
            return self.age_years
        if name == "birth_year":
            return self.birth_year
        if name.startswith("immunity_"):
            return self.immunity.get(name.removeprefix("immunity_"))
        if hasattr(self, name) and name not in {"conditions", "immunity", "safety", "history"}:
            return getattr(self, name)
        return self.safety.get(name)
