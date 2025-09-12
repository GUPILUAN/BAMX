from flask_jwt_extended import create_access_token, create_refresh_token
from ..security import hash_aspel
from ..repositories.user_repository import UserRepository
from ..dto import UserInfoDTO


class AuthService:
    def __init__(self):
        self.user_repo = UserRepository()

    def login(self, username: str, password: str) -> tuple[dict, int]:
        if not username or not password:
            return {"msg": "Faltan credenciales"}, 400
        user = self.user_repo.find_by_username(username)
        if not user or not hash_aspel(password) == user.PASS:
            return {"msg": "Usuario o contraseña incorrectos"}, 401

        user_id = str(user.IDUSR)
        access_token = create_access_token(identity=user_id)
        refresh_token = create_refresh_token(identity=user_id)
        return {"access": access_token, "refresh": refresh_token}, 200

    def refresh(self, user_id: str) -> tuple[dict, int]:
        access_token = create_access_token(identity=user_id)
        return {"access": access_token}, 200

    def logout(self, user_id: str) -> tuple[dict, int]:
        return {"msg": "Logout exitoso"}, 200

    def get_info(self, user_id: str) -> tuple[dict, int]:
        user: UserInfoDTO | None = self.user_repo.find_by_id(int(user_id))
        if not user:
            return {"msg": "Usuario no encontrado"}, 404
        return {"user": user.to_dict()}, 200
