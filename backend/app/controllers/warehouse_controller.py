from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from ..repositories.warehouse_repository import WarehouseRepository
from ..services.warehouse_service import WarehouseService

_warehouse_repository: WarehouseRepository
warehouse_bp = Blueprint("warehouse", __name__)
_warehouse_repository = WarehouseRepository()
_service = WarehouseService(_warehouse_repository)


@warehouse_bp.route("/", methods=["GET"])
@jwt_required()
def get_warehouse():
    warehouse, status = _service.warehouses_with_products()
    return jsonify(warehouse), status


@warehouse_bp.route("/todos", methods=["GET"])
@jwt_required()
def get_all_warehouses():
    warehouses = _service.get_all_warehouses()
    return jsonify(warehouses), 200


@warehouse_bp.route("/metricas", methods=["GET"])
@jwt_required()
def get_metrics_all_warehouses():
    metrics, status = _service.get_metrics_all_warehouses()
    return jsonify(metrics), status
