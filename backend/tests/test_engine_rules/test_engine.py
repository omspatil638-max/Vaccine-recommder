"""Fixture tests for the assessment engine. Dates are fixed so results are stable."""
from datetime import date

import pytest

from engine import Allergy, DoseRecord, Facts, Reaction, assess, load_all
from engine.knowledge import KnowledgeError, load_set

TODAY = date(2026, 9, 25)
US = load_all()["us-cdc-adult"]
IN = load_all()["in-uip"]
ALL_US = ["influenza", "tdap", "hepb", "mmr", "varicella", "zoster", "hpv", "pneumococcal"]
SAFE = {k: False for k in ("current_illness", "current_shingles", "recent_blood_product", "thrombocytopenia",
                           "antivirals_24h", "neuro_unstable", "family_immunodeficiency")}


def person(age=None, dob=None, **kw) -> Facts:
    """A fully-answered baseline adult with no risk factors; override per test."""
    if dob is None and age is not None:
        dob = date(TODAY.year - age, 1, 1)
    base = dict(
        today=TODAY, birth_date=dob, pregnant=False, healthcare_personnel=False, student_traveler_contact=False,
        immunocompromised=False, severe_immunodeficiency=False,
        conditions={c: False for c in ("chronic_heart_disease", "chronic_lung_disease", "chronic_liver_disease",
                                       "chronic_kidney_disease", "diabetes", "asplenia", "sickle_cell", "hiv",
                                       "cochlear_implant", "smoker")},
        immunity={"mmr": False, "varicella": False},
        history={v: "not_received" for v in ALL_US + ["td"]},
        allergy_triage="no", reaction_triage="no", safety=dict(SAFE),
    )
    base.update(kw)
    return Facts(**base)


def result(run, vid):
    return next(r for r in run["results"] if r["vaccineId"] == vid)


# --- Knowledge integrity -------------------------------------------------------------

def test_every_rule_has_a_known_source_and_section():
    for gs in load_all().values():
        for v in gs.vaccines.values():
            rules = v["indications"] + v.get("contraindications", []) + v.get("precautions", [])
            for r in rules:
                assert r["source"] in gs.sources, r["id"]
                assert r["section"], r["id"]
        for s in gs.sources.values():
            assert s["url"].startswith("https://") and s["retrieved_at"]


def test_invalid_knowledge_is_rejected(tmp_path):
    folder = tmp_path / "bad"
    (folder / "vaccines").mkdir(parents=True)
    (folder / "guideline.json").write_text(
        '{"id":"bad","jurisdiction":"XX","name":"x","version":"1","last_verified":"2026-01-01",'
        '"population":{},"sources":[]}', encoding="utf-8")
    (folder / "vaccines" / "v.json").write_text(
        '{"id":"v","name":"v","short_name":"v","protects_against":"x","series":{"kind":"series","doses":[{"n":1}]},'
        '"indications":[{"id":"R1","status":"RECOMMENDED","when":{"fact":"age_years","gte":1},"reason":"x",'
        '"factors":[],"source":"missing-source","section":"s"}]}', encoding="utf-8")
    with pytest.raises(KnowledgeError, match="unknown source"):
        load_set(folder)


# --- Fail-closed run-level outcomes ----------------------------------------------------

def test_no_guideline_for_country_fails_closed():
    run = assess(person(age=40), None)
    assert run["outcome"] == "NO_GUIDELINE" and run["results"] == []


def test_missing_date_of_birth_gives_no_recommendations():
    run = assess(person(dob=None), US)
    assert run["outcome"] == "INSUFFICIENT_INFORMATION"
    assert run["results"] == []


def test_us_under_19_not_covered():
    assert assess(person(age=18), US)["outcome"] == "POPULATION_NOT_COVERED"


def test_india_non_pregnant_adult_not_covered_and_not_given_us_rules():
    run = assess(person(age=30), IN)
    assert run["outcome"] == "POPULATION_NOT_COVERED"
    assert run["results"] == []


def test_india_pregnancy_unknown_needs_information():
    run = assess(person(age=30, pregnant=None), IN)
    assert run["outcome"] == "INSUFFICIENT_INFORMATION"


# --- Age-based indications -------------------------------------------------------------

def test_healthy_30_year_old():
    run = assess(person(age=30), US)
    assert result(run, "influenza")["status"] == "RECOMMENDED"
    assert result(run, "hepb")["status"] == "RECOMMENDED"
    assert result(run, "hpv")["status"] == "MAY_BE_APPROPRIATE"
    assert result(run, "zoster")["status"] == "NOT_INDICATED"
    assert result(run, "pneumococcal")["status"] == "NOT_INDICATED"


def test_hpv_boundaries():
    assert result(assess(person(age=26), US), "hpv")["status"] == "RECOMMENDED"
    assert result(assess(person(age=45), US), "hpv")["status"] == "MAY_BE_APPROPRIATE"
    assert result(assess(person(age=46), US), "hpv")["status"] == "NOT_INDICATED"


def test_age_50_gets_zoster_and_pneumococcal():
    run = assess(person(age=50), US)
    assert result(run, "zoster")["status"] == "RECOMMENDED"
    assert result(run, "pneumococcal")["status"] == "RECOMMENDED"


def test_hepb_age_60_without_risk_is_may_be_appropriate():
    assert result(assess(person(age=62), US), "hepb")["status"] == "MAY_BE_APPROPRIATE"


def test_hepb_age_60_with_liver_disease_is_recommended():
    f = person(age=62)
    f.conditions["chronic_liver_disease"] = True
    assert result(assess(f, US), "hepb")["status"] == "RECOMMENDED"


def test_mmr_born_before_1957_not_indicated():
    assert result(assess(person(dob=date(1950, 5, 1)), US), "mmr")["status"] == "NOT_INDICATED"


def test_age_is_computed_from_date_of_birth_not_calendar_year():
    # Turns 50 on 26 September 2026, the day after TODAY.
    run = assess(person(dob=date(1976, 9, 26)), US)
    assert result(run, "zoster")["status"] == "NOT_INDICATED"


# --- Medical risk conditions -----------------------------------------------------------

def test_pneumococcal_for_under_50_with_diabetes():
    f = person(age=35)
    f.conditions["diabetes"] = True
    r = result(assess(f, US), "pneumococcal")
    assert r["status"] == "RECOMMENDED"
    assert "US-PNEUMO-19-49-RISK" in r["ruleIds"]


def test_unknown_condition_makes_pneumococcal_insufficient_not_negative():
    f = person(age=35)
    f.conditions["diabetes"] = None
    r = result(assess(f, US), "pneumococcal")
    assert r["status"] == "INSUFFICIENT_INFORMATION"
    assert any("diabetes" in m.lower() for m in r["missing"])


def test_zoster_for_immunocompromised_under_50():
    f = person(age=30, immunocompromised=True)
    assert result(assess(f, US), "zoster")["status"] == "RECOMMENDED"


def test_severe_immunodeficiency_contraindicates_live_vaccines():
    f = person(age=30, immunocompromised=True, severe_immunodeficiency=True)
    run = assess(f, US)
    assert result(run, "mmr")["status"] == "CONTRAINDICATION"
    assert result(run, "varicella")["status"] == "CONTRAINDICATION"
    assert result(run, "influenza")["status"] == "RECOMMENDED"  # not live


# --- Pregnancy -------------------------------------------------------------------------

def test_pregnancy_tdap_before_week_27_is_not_yet_with_calculated_date():
    r = result(assess(person(age=30, pregnant=True, pregnancy_weeks=20), US), "tdap")
    assert r["status"] == "RECOMMENDED"
    assert r["timing"]["state"] == "NOT_YET"
    assert r["timing"]["earliestDate"] == "2026-11-13"  # 7 weeks after TODAY


def test_pregnancy_tdap_in_window_is_due_even_if_recent_tdap():
    f = person(age=30, pregnant=True, pregnancy_weeks=30,
               records=[DoseRecord("tdap", date(2022, 3, 1), "tdap")], history={"tdap": "received"})
    r = result(assess(f, US), "tdap")
    assert r["status"] == "RECOMMENDED" and r["timing"]["dueNow"]


def test_pregnancy_defers_live_and_hpv_vaccines():
    run = assess(person(age=24, pregnant=True, pregnancy_weeks=12), US)
    for vid in ("mmr", "varicella", "hpv"):
        r = result(run, vid)
        assert r["status"] == "CONTRAINDICATION", vid
        assert any(s["kind"] == "defer" for s in r["safety"])


def test_pregnancy_unknown_leaves_live_vaccine_for_review():
    r = result(assess(person(age=24, pregnant=None), US), "mmr")
    assert r["status"] == "REVIEW_WITH_PROFESSIONAL"


def test_india_td_pregnancy_two_doses_four_weeks_apart():
    f = person(age=26, pregnant=True, pregnancy_weeks=16,
               records=[DoseRecord("td", date(2026, 9, 10))], history={"td": "received"})
    r = result(assess(f, IN), "td")
    assert r["status"] == "RECOMMENDED"
    assert r["timing"]["nextDose"] == 2
    assert r["timing"]["earliestDate"] == "2026-10-08"
    assert r["timing"]["dueNow"] is False


def test_india_td_single_booster_if_vaccinated_within_3_years():
    f = person(age=26, pregnant=True, pregnancy_weeks=10,
               records=[DoseRecord("td", date(2024, 12, 1)), DoseRecord("td", date(2025, 1, 1))],
               history={"td": "received"})
    r = result(assess(f, IN), "td")
    assert r["timing"]["dosesRequired"] == 1


# --- History and uncertainty -----------------------------------------------------------

def test_unknown_history_is_not_treated_as_never_vaccinated():
    f = person(age=30)
    f.history["hepb"] = "unknown"
    r = result(assess(f, US), "hepb")
    assert r["status"] == "INSUFFICIENT_INFORMATION"
    assert "Records of your previous doses" in r["missing"]


def test_received_but_no_dates_is_insufficient():
    f = person(age=30)
    f.history["hepb"] = "received"
    assert result(assess(f, US), "hepb")["status"] == "INSUFFICIENT_INFORMATION"


def test_hepb_partial_series_calculates_next_dose():
    f = person(age=30, records=[DoseRecord("hepb", date(2026, 8, 1))], history={"hepb": "received"})
    t = result(assess(f, US), "hepb")["timing"]
    assert t["nextDose"] == 2 and t["earliestDate"] == "2026-08-29" and t["dueNow"]


def test_hepb_dose_3_respects_minimum_from_dose_1():
    f = person(age=30, history={"hepb": "received"},
               records=[DoseRecord("hepb", date(2026, 6, 1)), DoseRecord("hepb", date(2026, 7, 1))])
    t = result(assess(f, US), "hepb")["timing"]
    # 8 weeks after dose 2 is 26 Aug, but 16 weeks after dose 1 is 21 Sep -> later wins.
    assert t["earliestDate"] == "2026-09-21"


def test_dose_given_too_soon_is_not_counted():
    f = person(age=30, history={"hepb": "received"},
               records=[DoseRecord("hepb", date(2026, 9, 1)), DoseRecord("hepb", date(2026, 9, 10))])
    t = result(assess(f, US), "hepb")["timing"]
    assert t["dosesCounted"] == 1
    assert any("minimum interval" in n for n in t["notes"])


def test_delayed_series_does_not_restart():
    f = person(age=55, history={"zoster": "received"}, records=[DoseRecord("zoster", date(2023, 1, 5))])
    t = result(assess(f, US), "zoster")["timing"]
    assert t["nextDose"] == 2 and t["dueNow"]


def test_completed_series_is_up_to_date():
    f = person(age=55, history={"zoster": "received"},
               records=[DoseRecord("zoster", date(2025, 1, 5)), DoseRecord("zoster", date(2025, 4, 5))])
    assert result(assess(f, US), "zoster")["status"] == "UP_TO_DATE"


def test_flu_dose_this_season_is_up_to_date_last_season_is_due():
    this = person(age=40, history={"influenza": "received"}, records=[DoseRecord("influenza", date(2026, 9, 1))])
    last = person(age=40, history={"influenza": "received"}, records=[DoseRecord("influenza", date(2025, 10, 1))])
    assert result(assess(this, US), "influenza")["status"] == "UP_TO_DATE"
    assert result(assess(last, US), "influenza")["status"] == "RECOMMENDED"


def test_td_booster_within_10_years_is_up_to_date():
    f = person(age=40, history={"tdap": "received"}, records=[DoseRecord("tdap", date(2020, 1, 1), "tdap")])
    r = result(assess(f, US), "tdap")
    assert r["status"] == "UP_TO_DATE"


def test_pneumococcal_pcv20_complete_other_product_needs_review():
    done = person(age=60, history={"pneumococcal": "received"},
                  records=[DoseRecord("pneumococcal", date(2024, 1, 1), "pcv20")])
    other = person(age=60, history={"pneumococcal": "received"},
                   records=[DoseRecord("pneumococcal", date(2015, 1, 1), "ppsv23")])
    assert result(assess(done, US), "pneumococcal")["status"] == "UP_TO_DATE"
    assert result(assess(other, US), "pneumococcal")["status"] == "REVIEW_WITH_PROFESSIONAL"


def test_mmr_immunity_evidence():
    f = person(age=30, immunity={"mmr": True, "varicella": False})
    assert result(assess(f, US), "mmr")["status"] == "UP_TO_DATE"


def test_healthcare_worker_needs_two_mmr_doses():
    f = person(age=30, healthcare_personnel=True, history={"mmr": "received"},
               records=[DoseRecord("mmr", date(2001, 1, 1))])
    r = result(assess(f, US), "mmr")
    assert r["status"] == "RECOMMENDED" and r["timing"]["dosesRequired"] == 2


# --- Allergy and reaction safety -------------------------------------------------------

def test_food_allergy_unrelated_to_vaccines_changes_nothing():
    f = person(age=30, allergy_triage="yes", allergies=[Allergy("peanut", "food", "anaphylaxis")])
    assert result(assess(f, US), "hepb")["status"] == "RECOMMENDED"


def test_yeast_anaphylaxis_contraindicates_hepb_only():
    f = person(age=30, allergy_triage="yes", allergies=[Allergy("yeast", "food", "anaphylaxis")])
    run = assess(f, US)
    assert result(run, "hepb")["status"] == "CONTRAINDICATION"
    # Not a verified component of other vaccines -> professional review, not contraindication.
    assert result(run, "influenza")["status"] == "RECOMMENDED"
    assert result(run, "mmr")["status"] == "REVIEW_WITH_PROFESSIONAL"


def test_allergy_not_sure_needs_review():
    f = person(age=30, allergy_triage="unsure")
    assert result(assess(f, US), "hepb")["status"] == "REVIEW_WITH_PROFESSIONAL"


def test_previous_anaphylaxis_to_same_vaccine_is_contraindication():
    f = person(age=30, reaction_triage="yes", reactions=[Reaction("influenza", "anaphylaxis")])
    run = assess(f, US)
    assert result(run, "influenza")["status"] == "CONTRAINDICATION"
    assert result(run, "hepb")["status"] == "RECOMMENDED"


def test_reaction_to_unknown_vaccine_sends_all_for_review():
    f = person(age=30, reaction_triage="yes", reactions=[Reaction("unknown", "anaphylaxis")])
    assert result(assess(f, US), "hepb")["status"] == "REVIEW_WITH_PROFESSIONAL"


def test_gbs_after_flu_is_precaution():
    f = person(age=30, reaction_triage="yes", reactions=[Reaction("influenza", "gbs_6_weeks")])
    r = result(assess(f, US), "influenza")
    assert r["status"] == "REVIEW_WITH_PROFESSIONAL"
    assert any(s["ruleId"] == "US-FLU-PR-GBS" for s in r["safety"])


def test_encephalopathy_after_pertussis_vaccine_contraindicates_tdap():
    f = person(age=30, reaction_triage="yes", reactions=[Reaction("tdap", "encephalopathy_7_days")])
    assert result(assess(f, US), "tdap")["status"] == "CONTRAINDICATION"


def test_current_illness_is_precaution_for_all_due_vaccines():
    f = person(age=30)
    f.safety["current_illness"] = True
    run = assess(f, US)
    assert result(run, "influenza")["status"] == "REVIEW_WITH_PROFESSIONAL"


def test_current_shingles_is_precaution_for_zoster():
    f = person(age=55)
    f.safety["current_shingles"] = True
    assert result(assess(f, US), "zoster")["status"] == "REVIEW_WITH_PROFESSIONAL"


def test_safety_not_checked_when_up_to_date():
    f = person(age=40, allergy_triage="unsure", history={"influenza": "received"},
               records=[DoseRecord("influenza", date(2026, 9, 1))])
    assert result(assess(f, US), "influenza")["status"] == "UP_TO_DATE"


# --- Explanation and provenance -----------------------------------------------------------

def test_every_result_carries_rule_ids_sources_and_guideline():
    run = assess(person(age=55), US)
    assert run["guidelineSet"]["version"] == "Addendum updated July 2, 2025"
    for r in run["results"]:
        assert r["ruleIds"], r["vaccineId"]
        assert r["sources"], r["vaccineId"]
        assert any(b["factor"] == "location" for b in r["basedOn"])


def test_results_are_ordered_action_first():
    run = assess(person(age=30), US)
    statuses = [r["status"] for r in run["results"]]
    assert statuses.index("RECOMMENDED") < statuses.index("NOT_INDICATED")


def test_engine_is_deterministic():
    assert assess(person(age=44), US) == assess(person(age=44), US)
