from sqlalchemy.orm import joinedload
from ..models import Usuario, UsrEmp


class UserRepository:
    def find_by_username(self, username: str) -> Usuario | None:
        return Usuario.query.filter_by(USUARIO=username).first()

    def find_by_id(self, user_id: int) -> Usuario | None:
        user = (
            Usuario.query.options(
                joinedload(Usuario.FOTO),  # type: ignore
                joinedload(Usuario.EMPRESAS).joinedload(UsrEmp.ROL),  # type: ignore
            )
            .filter_by(IDUSR=user_id)
            .first()
        )

        if user:
            return user

        return None
