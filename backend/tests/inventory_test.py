from flask.testing import FlaskClient
from werkzeug.wrappers import Response
from flask_jwt_extended import create_access_token


def test_inventory_list(client: FlaskClient) -> None:

    access_token = create_access_token(identity="Test")

    headers = {"Authorization": f"Bearer {access_token}"}
    res: Response = client.get("/api/inventario/", headers=headers)

    assert res.status_code == 200
    body: dict = res.get_json()
    assert body["success"] is True
    assert "items" in body["data"]
    assert isinstance(body["data"]["items"], list)
    if body["data"]["items"]:
        item = body["data"]["items"][0]
        assert "product_id" in item
        assert "product_name" in item
        assert "available_quantity" in item
        assert "expiration_date" in item
        assert "last_movement" in item
        assert "lot" in item
        assert "type" in item
