from sqlalchemy.orm import joinedload
from ..models import Usuario, FotoUsuario, Rol001005, UsrEmp
from ..dto import UserInfoDTO
from ..mappers.usuario_to_userinfo import usuario_to_dto


class UserRepository:
    def find_by_username(self, username: str):
        return Usuario.query.filter_by(USUARIO=username).first()

    def find_by_id(self, user_id: int) -> UserInfoDTO | None:
        user = (
            Usuario.query.options(
                joinedload(Usuario.foto),  # type: ignore
                joinedload(Usuario.empresas).joinedload(UsrEmp.rol),  # type: ignore
            )
            .filter_by(IDUSR=user_id)
            .first()
        )

        if user:
            return usuario_to_dto(user)

        return None
