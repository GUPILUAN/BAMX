from typing import Generator
from unittest.mock import MagicMock
from flask.testing import FlaskClient
import pytest
from flask import Flask
from app import create_app
from app.repositories.database_repository import DatabaseRepository


@pytest.fixture
def app() -> Generator[Flask]:
    app = create_app("development")
    app.config.update(
        {
            "TESTING": True,
        }
    )
    yield app


@pytest.fixture
def client(app: Flask) -> FlaskClient:
    return app.test_client()


@pytest.fixture
def mock_repository() -> DatabaseRepository:
    repo: DatabaseRepository = MagicMock(spec=DatabaseRepository)
    repo.get_databases.return_value = ["db1", "db2"]
    return repo
