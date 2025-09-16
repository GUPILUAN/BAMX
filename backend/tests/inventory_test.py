from flask.testing import FlaskClient
from werkzeug.wrappers import Response
from flask_jwt_extended import create_access_token


def test_inventory_list(client: FlaskClient) -> None:
    access_token = create_access_token(identity="Test")

    headers = {"Authorization": f"Bearer {access_token}"}
    res: Response = client.get("/api/inventario/", headers=headers)

    assert res.status_code == 200
    body: list = res.get_json()
    assert isinstance(body, list)
    if body:
        item = body[0]
        assert "product_id" in item
        assert "available_quantity" in item
        assert "expiration_date" in item
        assert "last_movement" in item
        assert "lot" in item
        assert "product_name" in item
