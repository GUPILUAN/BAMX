from flask_jwt_extended import create_access_token, create_refresh_token
from werkzeug.security import check_password_hash, generate_password_hash
from app.repositories.user_repository import UserRepository


class AuthService:
    def __init__(self):
        self.user_repo = UserRepository()

    def login(self, data):
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return {"msg": "Faltan credenciales"}, 400

        user = self.user_repo.find_by_username(username)
        if not user or not check_password_hash(user["password"], password):
            return {"msg": "Usuario o contraseña incorrectos"}, 401

        access_token = create_access_token(identity=username)
        refresh_token = create_refresh_token(identity=username)
        return {"access": access_token, "refresh": refresh_token}, 200

    def register(self, data):
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return {"msg": "Faltan datos"}, 400

        try:
            user = self.user_repo.save(username, generate_password_hash(password))
            return {"msg": "Usuario creado", "user": user}, 201
        except ValueError as e:
            return {"msg": str(e)}, 400

    def refresh(self, username):
        return create_access_token(identity=username)
