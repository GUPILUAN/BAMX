from time import time
import token
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
)
from ..security import hash_aspel
from ..repositories.user_repository import UserRepository
from ..dto import UserInfoDTO, ApiResponse, AuthResponse


class AuthService:
    def __init__(self):
        self.user_repo = UserRepository()

    def login(
        self, username: str | None = None, password: str | None = None
    ) -> tuple[dict, int]:
        if not username or not password:
            return (
                ApiResponse(success=False, message="Faltan credenciales").__dict__,
                400,
            )
        user = self.user_repo.find_by_username(username)
        if not user or not hash_aspel(password) == user.PASS:
            return (
                ApiResponse(
                    success=False, message="Usuario o contraseña incorrectos"
                ).__dict__,
                401,
            )

        user_id = str(user.IDUSR)
        access_token = create_access_token(identity=user_id)
        refresh_token = create_refresh_token(identity=user_id)
        return AuthResponse(access=access_token, refresh=refresh_token).__dict__, 200

    def refresh(self, user_id: str, token=None, threshold=3600) -> tuple[dict, int]:
        import time

        access_token = create_access_token(identity=user_id)
        refresh_token = None
        if token and (token["exp"] - int(time.time())) < threshold:
            refresh_token = create_refresh_token(identity=user_id)

        return AuthResponse(access=access_token, refresh=refresh_token).__dict__, 200

    def logout(self) -> tuple[dict, int]:
        return ApiResponse(success=True, message="Logout exitoso").__dict__, 200

    def get_info(self, user_id: str) -> tuple[dict, int]:
        user: UserInfoDTO | None = self.user_repo.find_by_id(int(user_id))
        if not user:
            return (
                ApiResponse(success=False, message="Usuario no encontrado").__dict__,
                404,
            )
        return (
            ApiResponse(
                success=True,
                data={"user": user.__dict__},
                message="Información del usuario",
            ).__dict__,
            200,
        )
