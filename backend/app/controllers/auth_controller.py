from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.auth_service import AuthService

auth_bp = Blueprint("auth", __name__)
auth_service: AuthService = AuthService()


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    result, status = auth_service.login(data)
    return jsonify(result), status


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json
    result, status = auth_service.register(data)
    return jsonify(result), status


@auth_bp.route("/token/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    current_user = get_jwt_identity()
    new_token = auth_service.refresh(current_user)
    return jsonify({"access": new_token}), 200
