from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..services.auth_service import AuthService

auth_bp = Blueprint("auth", __name__)
auth_service: AuthService = AuthService()


@auth_bp.route("/login", methods=["POST"])
def login():
    data: dict | None = request.json
    if not data:
        return jsonify({"msg": "Faltan credenciales"}), 400

    result, status = auth_service.login(**data)
    return jsonify(result), status


@auth_bp.route("/token/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    current_user: str = get_jwt_identity()
    new_token = auth_service.refresh(current_user)
    return jsonify({"access": new_token}), 200
