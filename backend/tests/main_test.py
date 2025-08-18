from unittest.mock import MagicMock
from flask.testing import FlaskClient
from werkzeug.wrappers import Response

from app.repositories.database_repository import DatabaseRepository
from app.services.database_service import DatabaseService


def test_check_health(client: FlaskClient) -> None:  # Check health
    res: Response = client.get("/api/health")
    assert res.status_code == 200
    body: dict = res.get_json()
    assert body["status"] == "ok"


def test_listar_bases(mock_repository: DatabaseRepository) -> None:
    service: DatabaseService = DatabaseService(
        mock_repository, "mysql://user:pass@localhost:3306"
    )
    result: list[str] = service.listar_bases()
    assert result == ["db1", "db2"]
    mock_repository.get_databases.assert_called_once()  # type: ignore
