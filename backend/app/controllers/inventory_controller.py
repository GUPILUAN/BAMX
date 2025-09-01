from base64 import b64encode
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from ..repositories.inventory_repository import InventoryRepository
from ..services.inventory_service import InventoryService

_inventory_repository: InventoryRepository
inventario_bp = Blueprint("inventario", __name__)

_inventory_repository = InventoryRepository()
_service = InventoryService(_inventory_repository)


@inventario_bp.route("/", methods=["GET"])
@jwt_required()
def get_inventario():
    items = _service.listar_inventario()
    return jsonify(
        [
            {
                "product_id": i.CVE_ART,
                "name": i.DESCR,
                "quantity": i.EXIST,
                "entry_date": i.F_CREA_ML.isoformat() if i.F_CREA_ML else None,
                "expiration_date": i.FCH_ULTVTA.isoformat() if i.FCH_ULTVTA else None,
                "type": i.LIN_PROD,
                "image": (
                    b64encode(i.IMAGEN_ML).decode("utf-8") if i.IMAGEN_ML else None
                ),
            }
            for i in items
        ]
    )
