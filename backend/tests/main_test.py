from app import create_app


def setup_app():
    app = create_app("development")
    return app


def test_check_health():
    app = setup_app()
    client = app.test_client()
    # Check health
    res = client.get("/api/health")
    assert res.status_code == 200
    body = res.get_json()
    assert body["status"] == "ok"
