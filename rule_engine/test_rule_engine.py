import unittest
from rule_engine.models import UserProfile, VaccinationRecord
from rule_engine.evaluator import RuleEngineEvaluator

class TestRuleEngine(unittest.TestCase):
    def setUp(self):
        self.evaluator = RuleEngineEvaluator()

    def test_pregnancy_tdap_rule(self):
        profile = UserProfile(
            id="TEST-PREG-001",
            age=28,
            sex="female",
            pregnancyStatus="pregnant_2nd_trimester"
        )
        result = self.evaluator.evaluate(profile, [])
        
        tdap = next(r for r in result.recommendations if r.vaccineId == "TDAP")
        self.assertEqual(tdap.status, "due")
        self.assertEqual(tdap.reasonCode, "PREGNANCY_TDAP_27_36_WEEKS")
        self.assertTrue(tdap.needsProfessionalReview)
        self.assertIn("27–36", tdap.reason)

    def test_immunocompromised_yellow_fever_contraindication(self):
        profile = UserProfile(
            id="TEST-IMMUNO-001",
            age=45,
            immunocompromised=True,
            travelDestination="Brazil"
        )
        result = self.evaluator.evaluate(profile, [])
        
        yf = next(r for r in result.recommendations if r.vaccineId == "YELLOW_FEVER")
        self.assertEqual(yf.status, "not_applicable")
        self.assertGreater(len(yf.contraindicationsFlagged), 0)
        self.assertIn("CONTRAINDICATION", yf.contraindicationsFlagged[0])
        self.assertTrue(yf.needsProfessionalReview)

    def test_unknown_history_handling(self):
        profile = UserProfile(
            id="TEST-UNK-001",
            age=67,
            medicalConditions=["type_2_diabetes"]
        )
        history = [
            VaccinationRecord(
                vaccineCode="PNEUMOCOCCAL_PCV20",
                vaccineName="Pneumococcal Conjugate",
                status="unknown"
            )
        ]
        result = self.evaluator.evaluate(profile, history)
        
        pneumo = next(r for r in result.recommendations if r.vaccineId == "PNEUMOCOCCAL_PCV20")
        self.assertEqual(pneumo.status, "unknown")
        self.assertIn("unavailable", pneumo.reason.lower())
        self.assertIsNotNone(pneumo.missingInfo)

    def test_healthcare_worker_hepb_overdue(self):
        profile = UserProfile(
            id="TEST-HCW-001",
            occupation="healthcare_worker"
        )
        history = [
            VaccinationRecord(
                vaccineCode="HEP_B",
                vaccineName="Hepatitis B",
                doseNumber=1,
                status="partial"
            )
        ]
        result = self.evaluator.evaluate(profile, history)
        
        hepb = next(r for r in result.recommendations if r.vaccineId == "HEP_B")
        self.assertEqual(hepb.status, "overdue")
        self.assertEqual(hepb.reasonCode, "INCOMPLETE_SERIES_HCW_EXPOSURE")

if __name__ == "__main__":
    unittest.main()
