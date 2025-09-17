import datetime
from types import SimpleNamespace
from typing import Generator
from flask.testing import FlaskClient
import pytest
from flask import Flask
from app import create_app
from app.repositories.user_repository import UserRepository
from app.repositories.inventory_repository import InventoryRepository
from tests.helpers import patch_repo_method


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


@pytest.fixture(autouse=True)
def mock_inventory():

    mock_items = [
        SimpleNamespace(
            product_id="123",
            product_name="Manzanas",
            lot="A123",
            available_quantity=50,
            production_date=datetime.date(2025, 9, 1),
            expiration_date=datetime.date(2025, 9, 20),
            last_movement=datetime.date(2025, 9, 15),
            warehouse="Central",
            status="A",
            type="Fruta",
        )
    ]
    patcher = patch_repo_method(
        InventoryRepository,
        "get_all",
        return_value=mock_items,
    )
    try:
        yield
    finally:
        patcher.stop()


@pytest.fixture(autouse=True)
def mock_user_repo_find_by_username():

    patcher = patch_repo_method(
        UserRepository,
        "find_by_username",
        return_value=SimpleNamespace(
            IDUSR=1,
            USUARIO="Test",
            PASS="¸©·¸",  # Aspel hash for "test"
        ),
    )

    try:
        yield
    finally:
        patcher.stop()


@pytest.fixture(autouse=True)
def mock_user_repo_find_by_id():

    patcher = patch_repo_method(
        UserRepository,
        "find_by_id",
        return_value=SimpleNamespace(
            IDUSR=1,
            USUARIO="Test",
            PASS="¸©·¸",  # Aspel hash for "test"
            NOMBRE="Test User",
            MAIL="test@example.com",
            ESTADO="A",
            PUESTO="Tester",
            DEPTO="QA",
            FOTO=None,
            EMPRESAS=[
                SimpleNamespace(
                    EMPRESA="Test Company",
                    STATUS=0,
                    ROL=SimpleNamespace(NOMBRE="admin"),
                )
            ],
        ),
    )

    try:
        yield
    finally:
        patcher.stop()
