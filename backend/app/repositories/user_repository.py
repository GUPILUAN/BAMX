from ..models import User


class UserRepository:
    def find_by_username(self, username: str):
        return User.query.filter_by(USUARIO=username).first()

    def find_by_id(self, user_id: int):
        return User.query.filter_by(IDUSR=user_id).first()
