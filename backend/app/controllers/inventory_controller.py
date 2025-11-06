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
    inventory, status = _service.inventory_list()
    return jsonify(inventory), status
