from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from ..dto.register_product import RegisterProductDTO
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


@inventario_bp.route("/registrar", methods=["POST"])
@jwt_required()
def register_product():
    if not request.json:
        return jsonify({"message": "Missing JSON in request"}), 400
    inventory_data = RegisterProductDTO(
        CVE_ART=request.json.get("CVE_ART"),
        DESCR=request.json.get("DESCR"),
        LIN_PROD=request.json.get("LIN_PROD"),
    )
    if (
        not inventory_data.CVE_ART
        or not inventory_data.DESCR
        or inventory_data.LIN_PROD is None
    ):
        return jsonify({"message": "Missing required fields"}), 400
    result, status = _service.register_product(inventory_data)
    return jsonify(result), status


@inventario_bp.route("/all", methods=["GET"])
@jwt_required()
def get_all_products():
    products = _inventory_repository.get_products()
    products_list = [
        {
            "CVE_ART": product.CVE_ART,
            "DESCR": product.DESCR,
            "LIN_PROD": product.LIN_PROD,
        }
        for product in products
    ]
    return jsonify({"products": products_list}), 200
