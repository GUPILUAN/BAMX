from flask.testing import FlaskClient

from werkzeug.wrappers import Response


def test_login_missing_credentials(client: FlaskClient) -> None:
    res: Response = client.post("/api/auth/login", json={})
    assert res.status_code == 400
    body: dict = res.get_json()
    assert body["message"] == "Faltan credenciales"
    assert body["success"] is False


def test_login_invalid_credentials(client: FlaskClient) -> None:
    res: Response = client.post(
        "/api/auth/login", json={"username": "invalid", "password": "invalid"}
    )
    assert res.status_code == 401
    body: dict = res.get_json()
    assert body["message"] == "Usuario o contraseña incorrectos"
    assert body["success"] is False


def test_login_success(client: FlaskClient) -> None:
    res: Response = client.post(
        "/api/auth/login", json={"username": "Test", "password": "test"}
    )
    assert res.status_code == 200
    body: dict = res.get_json()
    assert "access" in body
    assert "refresh" in body
    assert body["access"] is not None
    assert body["refresh"] is not None
