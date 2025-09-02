from typing import Generator
from flask.testing import FlaskClient
import pytest
from flask import Flask
from app import create_app


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
