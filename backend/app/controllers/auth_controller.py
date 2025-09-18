from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from ..services.auth_service import AuthService

auth_bp = Blueprint("auth", __name__)
auth_service: AuthService = AuthService()


@auth_bp.route("/login", methods=["POST"])
def login():
    data: dict[str, str] = request.json or {}
    result, status = auth_service.login(**data)
    return jsonify(result), status


@auth_bp.route("/token/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    current_user: str = get_jwt_identity()
    new_token, status = auth_service.refresh(current_user, token=get_jwt())
    return jsonify(new_token), status


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    result, status = auth_service.logout()
    return jsonify(result), status


@auth_bp.route("/info", methods=["GET"])
@jwt_required()
def get_info():
    current_user: str = get_jwt_identity()
    result, status = auth_service.get_info(current_user)
    return jsonify(result), status
