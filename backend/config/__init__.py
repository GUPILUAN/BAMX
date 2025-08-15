import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "change-me")
    SQLALCHEMY_DATABASE_URI: str = os.getenv(
        "SQLALCHEMY_DATABASE_URI", "sqlite:///bamx.db"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS: bool = (
        os.getenv("SQLALCHEMY_TRACK_MODIFICATIONS", "false").lower() == "true"
    )
    SQLALCHEMY_ECHO: bool = os.getenv("SQLALCHEMY_ECHO", "false").lower() == "true"


class DevConfig(Config):
    DEBUG: bool = True


class ProdConfig(Config):
    DEBUG: bool = False


config_by_name: dict[str, type[Config]] = dict(
    development=DevConfig, production=ProdConfig
)
