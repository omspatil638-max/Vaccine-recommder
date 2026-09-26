"""End-to-end API journey plus security checks."""
from datetime import date
from uuid import uuid4

from engine.facts import CONDITIONS
from app.services.catalog import SAFETY_FACTS


def signup(client, email=None, password="correct horse battery"):
    email = email or f"user-{uuid4().hex[:8]}@example.com"
    res = client.post("/api/v1/auth/signup", json={"email": email, "password": password})
    assert res.status_code == 201, res.text
    return email, {"X-CSRF-Token": client.cookies.get("csrf_token")}


def complete_intake(client, h, country="US", pregnant=False):
    assert client.put("/api/v1/intake/profile", headers=h, json={
        "full_name": "Test Person", "birth_date": "1970-03-04", "sex_at_birth": "female",
        "pregnancy_status": "pregnant" if pregnant else "not_pregnant",
        "pregnancy_weeks": 20 if pregnant else None}).status_code == 200
    assert client.put("/api/v1/intake/location", headers=h, json={
        "country_code": country, "region": "Texas" if country == "US" else "Kerala",
        "city": "Somewhere", "lat": 30.2672, "lon": -97.7431}).status_code == 200
    assert client.put("/api/v1/intake/health", headers=h, json={
        "conditions": {c: "no" for c in CONDITIONS}, "immunocompromised": "no",
        "healthcare_personnel": "no", "student_traveler_contact": "no"}).status_code == 200
    assert client.put("/api/v1/intake/history", headers=h, json={
        "answers": {"influenza": "not_received", "hepb": "unknown", "zoster": "not_received"}, "immunity": {"mmr": "no"}}).status_code == 200
    assert client.put("/api/v1/intake/safety", headers=h, json={
        "allergy_triage": "no", "reaction_triage": "no", "answers": {k: "no" for k in SAFETY_FACTS}}).status_code == 200


def test_full_journey(client):
    email, h = signup(client)
    me = client.get("/api/v1/auth/me").json()
    assert me["progress"]["nextStep"] == "profile" and not me["progress"]["onboardingComplete"]

    # Can't assess before finishing intake.
    assert client.post("/api/v1/assessments", headers=h).status_code == 409

    complete_intake(client, h)
    assert client.get("/api/v1/auth/me").json()["progress"]["nextStep"] == "review"

    res = client.post("/api/v1/intake/complete", headers=h)
    assert res.status_code == 200
    run = client.get("/api/v1/assessments/latest").json()
    assert run["outcome"] == "COMPLETE"
    statuses = {r["vaccineId"]: r["status"] for r in run["result"]["results"]}
    assert statuses["zoster"] == "RECOMMENDED"          # age 56
    assert statuses["hepb"] == "INSUFFICIENT_INFORMATION"  # history unknown, not assumed
    assert run["result"]["guidelineSet"]["id"] == "us-cdc-adult"

    # Reminders generated from structured timing.
    reminders = client.get("/api/v1/reminders").json()
    assert any(r["vaccineId"] == "zoster" and r["kind"] == "due_now" for r in reminders)

    # Providers are demo-labelled and filtered by jurisdiction.
    prov = client.get("/api/v1/providers?vaccine=zoster").json()
    assert prov["dataOrigin"] == "DEMO" and prov["providers"]
    assert all(p["dataOrigin"] == "DEMO" and p["jurisdiction"] == "US" for p in prov["providers"])
    assert prov["providers"][0]["distanceKm"] is not None

    # Recording dose 1 re-runs the assessment and schedules dose 2.
    rec = client.post("/api/v1/intake/records", headers=h, json={
        "vaccine_id": "zoster", "date": date.today().isoformat(), "date_precision": "day", "dose_number": 1})
    assert rec.status_code == 201 and rec.json()["assessmentId"]
    after = client.get("/api/v1/assessments/latest").json()
    z = next(r for r in after["result"]["results"] if r["vaccineId"] == "zoster")
    assert z["timing"]["nextDose"] == 2 and z["timing"]["dueNow"] is False
    reminders = client.get("/api/v1/reminders").json()
    assert any(r["vaccineId"] == "zoster" and r["kind"] == "next_dose" for r in reminders)

    # History / activity records field names only.
    events = client.get("/api/v1/activity").json()
    assert any(e["entity"] == "vaccination_record" for e in events)
    assert all("Test Person" not in str(e) for e in events)

    # Vaccine knowledge with sources.
    detail = client.get("/api/v1/guidelines/us-cdc-adult/vaccines/zoster").json()
    assert detail["sources"] and detail["vaccine"]["content"]["common_reactions"]

    # Export, then delete.
    export = client.get("/api/v1/account/export")
    assert export.status_code == 200 and "Test Person" in export.text
    assert client.post("/api/v1/account/delete", headers=h, json={"password": "wrong"}).status_code == 403
    assert client.post("/api/v1/account/delete", headers=h, json={"password": "correct horse battery"}).status_code == 200
    assert client.get("/api/v1/auth/me").json()["user"] is None


def test_india_non_pregnant_is_not_given_recommendations(client):
    _, h = signup(client)
    complete_intake(client, h, country="IN", pregnant=False)
    client.post("/api/v1/intake/complete", headers=h)
    run = client.get("/api/v1/assessments/latest").json()
    assert run["outcome"] == "POPULATION_NOT_COVERED" and run["result"]["results"] == []


def test_other_country_fails_closed(client):
    _, h = signup(client)
    complete_intake(client, h)
    client.put("/api/v1/intake/location", headers=h, json={"country_code": "OTHER", "country_name": "Freedonia"})
    client.post("/api/v1/intake/complete", headers=h)
    assert client.get("/api/v1/assessments/latest").json()["outcome"] == "NO_GUIDELINE"


def test_mutations_require_csrf_header(client):
    _, h = signup(client)
    res = client.put("/api/v1/intake/health", json={})
    assert res.status_code == 403


def test_unauthenticated_access_is_rejected(client):
    client.cookies.clear()
    assert client.get("/api/v1/intake").status_code == 401
    assert client.get("/api/v1/providers").status_code == 401


def test_login_errors_are_generic_and_rate_limited(client):
    email, _ = signup(client)
    client.cookies.clear()
    bad = client.post("/api/v1/auth/login", json={"email": email, "password": "nope"})
    assert bad.status_code == 401 and "don't match" in bad.json()["detail"]
    for _ in range(5):
        client.post("/api/v1/auth/login", json={"email": email, "password": "nope"})
    assert client.post("/api/v1/auth/login", json={"email": email, "password": "correct horse battery"}).status_code == 429


def test_password_reset_flow(client):
    email, _ = signup(client)
    client.cookies.clear()
    res = client.post("/api/v1/auth/forgot", json={"email": email}).json()
    token = res["demoResetLink"].split("token=")[1]
    assert client.post("/api/v1/auth/reset", json={"token": token, "password": "a brand new password"}).status_code == 200
    assert client.post("/api/v1/auth/reset", json={"token": token, "password": "another new password"}).status_code == 400
    client.cookies.clear()
    ok = client.post("/api/v1/auth/login", json={"email": email, "password": "a brand new password"})
    assert ok.status_code == 200


def test_validation_rejects_bad_input(client):
    _, h = signup(client)
    under_18 = client.put("/api/v1/intake/profile", headers=h, json={
        "full_name": "Kid", "birth_date": date.today().replace(year=date.today().year - 10).isoformat(),
        "sex_at_birth": "male"})
    assert under_18.status_code == 422
    future = client.post("/api/v1/intake/records", headers=h, json={
        "vaccine_id": "hepb", "date": "2999-01-01", "date_precision": "day"})
    assert future.status_code == 422
    missing_answers = client.put("/api/v1/intake/safety", headers=h, json={
        "allergy_triage": "no", "reaction_triage": "no", "answers": {}})
    assert missing_answers.status_code == 422


def test_users_cannot_see_each_others_records(client):
    _, h1 = signup(client)
    rec = client.post("/api/v1/intake/records", headers=h1, json={
        "vaccine_id": "hepb", "date": "2020-01-01", "date_precision": "day"}).json()["record"]
    client.cookies.clear()
    _, h2 = signup(client)
    assert client.get(f"/api/v1/intake/records/{rec['id']}").status_code == 404
    assert client.delete(f"/api/v1/intake/records/{rec['id']}", headers=h2).status_code == 404
