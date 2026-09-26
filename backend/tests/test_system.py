def test_health(client):
    assert client.get("/api/v1/health").json() == {"status": "ok"}


def test_meta_reports_demo_mode(client):
    body = client.get("/api/v1/meta").json()
    assert body["demoMode"] is True
    assert "version" in body


def test_cors_rejects_unknown_origin(client):
    res = client.get("/api/v1/health", headers={"Origin": "https://evil.example"})
    assert "access-control-allow-origin" not in res.headers


def test_legacy_recommend_still_works(client):
    res = client.post(
        "/api/v1/recommend",
        json={"profile": {"age": 30, "sex": "female"}, "history": []},
    )
    assert res.status_code == 200
    assert len(res.json()["recommendations"]) == 6
