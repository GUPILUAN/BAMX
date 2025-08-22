from app.extensions import users_db


class UserRepository:
    def find_by_username(self, username: str):
        return users_db.get(username)

    def save(self, username: str, password_hash: str):
        if username in users_db:
            raise ValueError("Usuario ya existe")
        users_db[username] = {"username": username, "password": password_hash}
        return users_db[username]
