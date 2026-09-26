from test_api_flow import complete_intake, signup


def test_owner_can_fetch_record_after_onboarding(client):
    _, h = signup(client)
    complete_intake(client, h)
    client.post("/api/v1/intake/complete", headers=h)
    res = client.post("/api/v1/intake/records", headers=h, json={
        "vaccine_id": "influenza", "date": "2026-09-01", "date_precision": "day", "provider_text": "Pharmacy"})
    rid = res.json()["record"]["id"]
    got = client.get(f"/api/v1/intake/records/{rid}")
    assert got.status_code == 200, got.text
    assert got.json()["record"]["provider_text"] == "Pharmacy"
