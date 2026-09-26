from typing import List, Optional
from pydantic import BaseModel, Field

class VaccinationRecord(BaseModel):
    id: Optional[str] = None
    userId: Optional[str] = None
    vaccineCode: str
    vaccineName: str
    doseNumber: int = 1
    administrationDate: Optional[str] = None
    status: str = "completed"  # completed, partial, unknown, unavailable
    notes: Optional[str] = None

class UserProfile(BaseModel):
    id: str = "SYN-USR-DEFAULT"
    name: str = "Synthetic User"
    dob: Optional[str] = None
    age: int = 30
    sex: str = "female"  # female, male, other
    country: str = "USA"
    pregnancyStatus: str = "not_pregnant"  # not_pregnant, pregnant_1st_trimester, pregnant_2nd_trimester, pregnant_3rd_trimester, postpartum_lactating
    medicalConditions: List[str] = Field(default_factory=list)
    allergies: List[str] = Field(default_factory=list)
    immunocompromised: bool = False
    immunoMedications: List[str] = Field(default_factory=list)
    occupation: str = "none"
    travelDestination: Optional[str] = None
    travelDate: Optional[str] = None
    historyKnown: bool = True

class VaccineRecommendation(BaseModel):
    vaccineId: str
    vaccineName: str
    category: str
    status: str  # due, potentially_due, overdue, completed, unknown, not_applicable
    reasonCode: str
    reason: str
    evidenceDetail: str
    guidelineSource: str
    guidelineVersion: str
    ruleId: str
    needsProfessionalReview: bool = True
    reviewReason: Optional[str] = None
    missingInfo: Optional[str] = None
    contraindicationsFlagged: List[str] = Field(default_factory=list)

class RecommendationRequest(BaseModel):
    profile: UserProfile
    history: List[VaccinationRecord] = Field(default_factory=list)

class EvaluationResponse(BaseModel):
    profileId: str
    evaluatedAt: str
    guidelineVersion: str
    recommendations: List[VaccineRecommendation]
