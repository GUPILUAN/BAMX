from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from werkzeug.security import generate_password_hash
from config import Config
from flask_jwt_extended import JWTManager

jwt = JWTManager()

engine: Engine = create_engine(
    Config.SQLALCHEMY_DATABASE_URI, echo=Config.SQLALCHEMY_ECHO
)
users_db = {
    "user1": {"username": "user1", "password": generate_password_hash("password123")},
    "user2": {"username": "user2", "password": generate_password_hash("mipassword")},
}
