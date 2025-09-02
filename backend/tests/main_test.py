from unittest.mock import MagicMock
from flask.testing import FlaskClient
from werkzeug.wrappers import Response


def test_check_health(client: FlaskClient) -> None:  # Check health
    res: Response = client.get("/api/health")
    assert res.status_code == 200
    body: dict = res.get_json()
    assert body["status"] == "ok"

