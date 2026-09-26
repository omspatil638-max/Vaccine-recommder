import json
import os
from datetime import datetime
from typing import List, Optional
from rule_engine.models import UserProfile, VaccinationRecord, VaccineRecommendation, EvaluationResponse

GUIDELINE_FILE_PATH = os.path.join(
    os.path.dirname(__file__), "..", "data", "guidelines", "cdc_us_2026.json"
)

def load_guidelines():
    if os.path.exists(GUIDELINE_FILE_PATH):
        with open(GUIDELINE_FILE_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {
        "guideline_id": "CDC_ACIP_US_2026.1",
        "version": "2026.1",
        "name": "CDC ACIP Adult Immunization Schedule 2026"
    }

class RuleEngineEvaluator:
    def __init__(self):
        self.guidelines = load_guidelines()
        self.guideline_source = self.guidelines.get("name", "CDC ACIP Guidelines")
        self.guideline_version = self.guidelines.get("version", "2026.1")

    def evaluate(self, profile: UserProfile, history: List[VaccinationRecord]) -> EvaluationResponse:
        recommendations: List[VaccineRecommendation] = []

        # Index history by vaccine code
        history_map = {rec.vaccineCode.upper(): rec for rec in history}

        # 1. Tdap Evaluation (Routine & Pregnancy)
        tdap_rec = self._evaluate_tdap(profile, history_map.get("TDAP"))
        recommendations.append(tdap_rec)

        # 2. Seasonal Influenza Evaluation
        flu_rec = self._evaluate_flu(profile, history_map.get("INFLUENZA_SEASONAL") or history_map.get("FLU"))
        recommendations.append(flu_rec)

        # 3. Hepatitis B Evaluation (Occupational & Catch-Up)
        hepb_rec = self._evaluate_hepb(profile, history_map.get("HEP_B"))
        recommendations.append(hepb_rec)

        # 4. Yellow Fever Evaluation (Travel-Related & Live Vaccine Precaution)
        yf_rec = self._evaluate_yellow_fever(profile, history_map.get("YELLOW_FEVER"))
        recommendations.append(yf_rec)

        # 5. MMR Evaluation (Routine & Pregnancy Contraindication)
        mmr_rec = self._evaluate_mmr(profile, history_map.get("MMR"))
        recommendations.append(mmr_rec)

        # 6. Pneumococcal PCV20 Evaluation (Age & Chronic Conditions / Unknown Record Handling)
        pneumo_rec = self._evaluate_pneumococcal(profile, history_map.get("PNEUMOCOCCAL_PCV20") or history_map.get("PNEUMO"))
        recommendations.append(pneumo_rec)

        return EvaluationResponse(
            profileId=profile.id,
            evaluatedAt=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            guidelineVersion=self.guideline_version,
            recommendations=recommendations
        )

    def _evaluate_tdap(self, profile: UserProfile, past_rec: Optional[VaccinationRecord]) -> VaccineRecommendation:
        is_pregnant = "pregnant" in profile.pregnancyStatus
        
        if is_pregnant:
          return VaccineRecommendation(
              vaccineId="TDAP",
              vaccineName="Tetanus, Diphtheria, Acellular Pertussis (Tdap)",
              category="Routine & Pregnancy",
              status="due",
              reasonCode="PREGNANCY_TDAP_27_36_WEEKS",
              reason="Recommended during weeks 27–36 of each pregnancy to pass maternal antibodies to the infant, regardless of prior Tdap timing.",
              evidenceDetail="CDC ACIP Guideline Section 4.2: Administer 1 dose Tdap during each pregnancy, preferably during 27 through 36 weeks of gestation.",
              guidelineSource=self.guideline_source,
              guidelineVersion=self.guideline_version,
              ruleId="RULE-TDAP-PREG-2026",
              needsProfessionalReview=True,
              reviewReason="Confirm current gestational age with attending OB/GYN before administration.",
              missingInfo=None,
              contraindicationsFlagged=[]
          )

        if past_rec and past_rec.status == "completed":
            return VaccineRecommendation(
                vaccineId="TDAP",
                vaccineName="Tetanus, Diphtheria, Acellular Pertussis (Tdap)",
                category="Routine",
                status="completed",
                reasonCode="TDAP_10YR_BOOSTER_COMPLETED",
                reason="Tdap dose completed. Td or Tdap booster recommended every 10 years.",
                evidenceDetail="CDC ACIP Guideline: Routine Td/Tdap booster every 10 years.",
                guidelineSource=self.guideline_source,
                guidelineVersion=self.guideline_version,
                ruleId="RULE-TDAP-ROUTINE-2026",
                needsProfessionalReview=False,
                reviewReason=None,
                missingInfo=None,
                contraindicationsFlagged=[]
            )

        return VaccineRecommendation(
            vaccineId="TDAP",
            vaccineName="Tetanus, Diphtheria, Acellular Pertussis (Tdap)",
            category="Routine",
            status="due",
            reasonCode="TDAP_ADULT_PRIMARY",
            reason="Tdap vaccine recommended for all adults who have not previously received a dose.",
            evidenceDetail="CDC ACIP Guideline: 1 dose Tdap for adults with unrecorded history.",
            guidelineSource=self.guideline_source,
            guidelineVersion=self.guideline_version,
            ruleId="RULE-TDAP-CATCHUP-2026",
            needsProfessionalReview=True,
            reviewReason="Verify prior adolescent Tdap documentation.",
            missingInfo=None,
            contraindicationsFlagged=[]
        )

    def _evaluate_flu(self, profile: UserProfile, past_rec: Optional[VaccinationRecord]) -> VaccineRecommendation:
        return VaccineRecommendation(
            vaccineId="INFLUENZA_SEASONAL",
            vaccineName="Seasonal Influenza (Inactivated / Recombinant)",
            category="Routine Annual",
            status="due",
            reasonCode="ANNUAL_SEASONAL_PREGNANCY_HCW",
            reason="Annual influenza vaccination is recommended for all pregnant individuals and healthcare workers prior to or during flu season.",
            evidenceDetail="CDC ACIP Guideline Section 1.1: Any licensed, age-appropriate inactivated influenza vaccine (IIV4) or recombinant influenza vaccine (RIV4) is safe and indicated.",
            guidelineSource=self.guideline_source,
            guidelineVersion=self.guideline_version,
            ruleId="RULE-FLU-ANNUAL-2026",
            needsProfessionalReview=False,
            reviewReason=None,
            missingInfo=None,
            contraindicationsFlagged=[]
        )

    def _evaluate_hepb(self, profile: UserProfile, past_rec: Optional[VaccinationRecord]) -> VaccineRecommendation:
        is_hcw = profile.occupation in ["healthcare_worker", "laboratory_personnel"]
        
        if past_rec and past_rec.status == "partial":
            return VaccineRecommendation(
                vaccineId="HEP_B",
                vaccineName="Hepatitis B Vaccine Series",
                category="Occupational & Catch-Up",
                status="overdue",
                reasonCode="INCOMPLETE_SERIES_HCW_EXPOSURE",
                reason=f"Dose #{past_rec.doseNumber} recorded. Remaining dose(s) in 3-dose series are overdue.",
                evidenceDetail="CDC ACIP Hepatitis B Guidelines: Complete 3-dose series required for healthcare personnel.",
                guidelineSource=self.guideline_source,
                guidelineVersion=self.guideline_version,
                ruleId="RULE-HEPB-HCW-CATCHUP-2026",
                needsProfessionalReview=True,
                reviewReason="Verify unrecorded doses or perform Anti-HBs serology titer.",
                missingInfo=None,
                contraindicationsFlagged=[]
            )

        if is_hcw:
            return VaccineRecommendation(
                vaccineId="HEP_B",
                vaccineName="Hepatitis B Vaccine Series",
                category="Occupational Exposure",
                status="due",
                reasonCode="HEPB_HCW_REQUIRED",
                reason="Indicated for healthcare personnel with occupational blood/body fluid exposure risk.",
                evidenceDetail="CDC ACIP Occupational Guidelines for Healthcare Workers.",
                guidelineSource=self.guideline_source,
                guidelineVersion=self.guideline_version,
                ruleId="RULE-HEPB-HCW-2026",
                needsProfessionalReview=True,
                reviewReason="Verify prior vaccination records at previous employer.",
                missingInfo=None,
                contraindicationsFlagged=[]
            )

        return VaccineRecommendation(
            vaccineId="HEP_B",
            vaccineName="Hepatitis B Vaccine Series",
            category="Routine Adult",
            status="completed" if past_rec and past_rec.status == "completed" else "potentially_due",
            reasonCode="HEPB_ADULT_UNIVERSAL",
            reason="Universal Hepatitis B vaccination recommended for adults aged 19-59.",
            evidenceDetail="CDC ACIP Universal Adult HepB Recommendation.",
            guidelineSource=self.guideline_source,
            guidelineVersion=self.guideline_version,
            ruleId="RULE-HEPB-UNIV-2026",
            needsProfessionalReview=False,
            reviewReason=None,
            missingInfo=None,
            contraindicationsFlagged=[]
        )

    def _evaluate_yellow_fever(self, profile: UserProfile, past_rec: Optional[VaccinationRecord]) -> VaccineRecommendation:
        has_travel = bool(profile.travelDestination and profile.travelDestination.strip())
        is_pregnant = "pregnant" in profile.pregnancyStatus
        is_immuno = profile.immunocompromised

        contraindications = []
        if is_immuno:
            contraindications.append("CONTRAINDICATION: Severe Immunosuppression (Live Virus Vaccine)")
        if is_pregnant:
            contraindications.append("PRECAUTION: Pregnancy (Live Virus Vaccine)")

        if is_immuno:
            return VaccineRecommendation(
                vaccineId="YELLOW_FEVER",
                vaccineName="Yellow Fever Vaccine (Stamaril - Live Attenuated)",
                category="Travel-Related",
                status="not_applicable",
                reasonCode="YF_CONTRAINDICATED_IMMUNOCOMPROMISED",
                reason="CONTRAINDICATED: Live attenuated vaccines must NOT be administered to severely immunocompromised individuals.",
                evidenceDetail="CDC Yellow Book 2026: Live yellow fever vaccine contraindication.",
                guidelineSource="CDC Yellow Book 2026",
                guidelineVersion=self.guideline_version,
                ruleId="RULE-YF-CONTRAIND-IMMUNO-2026",
                needsProfessionalReview=True,
                reviewReason="Contraindication flagged. Travel medical specialist must evaluate medical exemption certificate.",
                missingInfo=None,
                contraindicationsFlagged=contraindications
            )

        if has_travel:
            return VaccineRecommendation(
                vaccineId="YELLOW_FEVER",
                vaccineName="Yellow Fever Vaccine (Stamaril - Live Attenuated)",
                category="Travel-Related",
                status="potentially_due",
                reasonCode="TRAVEL_ENDEMIC_PRECAUTION_PREGNANCY",
                reason=f"Yellow fever risk exists for travel destination ({profile.travelDestination}). Live virus vaccine requires risk-benefit assessment during pregnancy.",
                evidenceDetail="CDC Health Information for International Travel (Yellow Book 2026).",
                guidelineSource="CDC Yellow Book 2026",
                guidelineVersion=self.guideline_version,
                ruleId="RULE-YF-TRAVEL-PREG-2026",
                needsProfessionalReview=True,
                reviewReason="Live vaccine precaution during pregnancy. Specialist travel clinic review required for itinerary risk assessment vs waiver certificate.",
                missingInfo=f"Exact travel itinerary in {profile.travelDestination} (urban vs endemic jungle region)",
                contraindicationsFlagged=contraindications
            )

        return VaccineRecommendation(
            vaccineId="YELLOW_FEVER",
            vaccineName="Yellow Fever Vaccine (Stamaril - Live Attenuated)",
            category="Travel-Related",
            status="not_applicable",
            reasonCode="NO_TRAVEL_EXPOSURE",
            reason="Not indicated without travel to yellow fever endemic regions.",
            evidenceDetail="CDC ACIP Travel Guidelines.",
            guidelineSource=self.guideline_source,
            guidelineVersion=self.guideline_version,
            ruleId="RULE-YF-NO-TRAVEL-2026",
            needsProfessionalReview=False,
            reviewReason=None,
            missingInfo=None,
            contraindicationsFlagged=[]
        )

    def _evaluate_mmr(self, profile: UserProfile, past_rec: Optional[VaccinationRecord]) -> VaccineRecommendation:
        is_pregnant = "pregnant" in profile.pregnancyStatus
        
        contraindications = []
        if is_pregnant:
            contraindications.append("CONTRAINDICATION: Active Pregnancy (Do NOT give additional MMR doses during pregnancy)")

        if past_rec and past_rec.status == "completed":
            return VaccineRecommendation(
                vaccineId="MMR",
                vaccineName="Measles, Mumps, Rubella (MMR)",
                category="Routine",
                status="completed",
                reasonCode="SERIES_COMPLETE_PREGNANCY_CONTRAINDICATION",
                reason="Childhood 2-dose series completed. Note: MMR is a live vaccine and contra-indicated during active pregnancy.",
                evidenceDetail="CDC ACIP MMR Guidelines: 2 doses documented.",
                guidelineSource=self.guideline_source,
                guidelineVersion=self.guideline_version,
                ruleId="RULE-MMR-COMPLETED-2026",
                needsProfessionalReview=False,
                reviewReason=None,
                missingInfo=None,
                contraindicationsFlagged=contraindications
            )

        return VaccineRecommendation(
            vaccineId="MMR",
            vaccineName="Measles, Mumps, Rubella (MMR)",
            category="Routine",
            status="potentially_due",
            reasonCode="MMR_ADULT_CATCHUP",
            reason="1 or 2 doses recommended for adults without evidence of immunity.",
            evidenceDetail="CDC ACIP MMR Schedule.",
            guidelineSource=self.guideline_source,
            guidelineVersion=self.guideline_version,
            ruleId="RULE-MMR-CATCHUP-2026",
            needsProfessionalReview=True,
            reviewReason="Verify rubella IgG antibody titer before ordering post-partum.",
            missingInfo=None,
            contraindicationsFlagged=contraindications
        )

    def _evaluate_pneumococcal(self, profile: UserProfile, past_rec: Optional[VaccinationRecord]) -> VaccineRecommendation:
        is_senior = profile.age >= 65
        has_risk_factor = any(cond in profile.medicalConditions for cond in ["type_2_diabetes", "chronic_kidney_disease", "asthma"])
        
        if not past_rec or past_rec.status == "unknown":
            if is_senior or has_risk_factor:
                return VaccineRecommendation(
                    vaccineId="PNEUMOCOCCAL_PCV20",
                    vaccineName="Pneumococcal Conjugate (PCV20 / PCV15+PPSV23)",
                    category="Risk-Based",
                    status="unknown",
                    reasonCode="UNKNOWN_VACCINATION_RECORD_UNAVAILABLE",
                    reason="Unknown — vaccination record unavailable. Patient has risk conditions making pneumococcal vaccine indicated, but past history is unrecorded.",
                    evidenceDetail="CDC ACIP Pneumococcal Recommendations for adults ≥65 or adults 19-64 with risk conditions.",
                    guidelineSource="CDC ACIP Adult Pneumococcal Guideline",
                    guidelineVersion=self.guideline_version,
                    ruleId="RULE-PNEUMO-UNK-2026",
                    needsProfessionalReview=True,
                    reviewReason="Record missing. Provider must verify state registry or past immunization records before ordering PCV20.",
                    missingInfo="Prior pneumococcal dose dates and vaccine formulations",
                    contraindicationsFlagged=[]
                )

        if past_rec and past_rec.status == "completed":
            return VaccineRecommendation(
                vaccineId="PNEUMOCOCCAL_PCV20",
                vaccineName="Pneumococcal Conjugate (PCV20)",
                category="Risk-Based",
                status="completed",
                reasonCode="PNEUMO_SERIES_COMPLETED",
                reason="Pneumococcal conjugate series completed.",
                evidenceDetail="CDC ACIP Pneumococcal Schedule.",
                guidelineSource=self.guideline_source,
                guidelineVersion=self.guideline_version,
                ruleId="RULE-PNEUMO-COMP-2026",
                needsProfessionalReview=False,
                reviewReason=None,
                missingInfo=None,
                contraindicationsFlagged=[]
            )

        return VaccineRecommendation(
            vaccineId="PNEUMOCOCCAL_PCV20",
            vaccineName="Pneumococcal Conjugate (PCV20)",
            category="Routine Adult",
            status="not_applicable",
            reasonCode="PNEUMO_NO_RISK",
            reason="Not indicated under age 65 without chronic kidney, diabetes, or lung risk factors.",
            evidenceDetail="CDC ACIP Pneumococcal Schedule.",
            guidelineSource=self.guideline_source,
            guidelineVersion=self.guideline_version,
            ruleId="RULE-PNEUMO-NORISK-2026",
            needsProfessionalReview=False,
            reviewReason=None,
            missingInfo=None,
            contraindicationsFlagged=[]
        )
