import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()


class Config:
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "change-me")
    JWT_ACCESS_TOKEN_EXPIRES: int = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 3600))
    JWT_REFRESH_TOKEN_EXPIRES: int = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES", 259200))
    SQLALCHEMY_TRACK_MODIFICATIONS: bool = (
        os.getenv("SQLALCHEMY_TRACK_MODIFICATIONS", "false").lower() == "true"
    )
    SQLALCHEMY_ECHO: bool = os.getenv("SQLALCHEMY_ECHO", "false").lower() == "true"


class DevConfig(Config):
    DEBUG: bool = True

    backend_path = Path(__file__).resolve().parent.parent.as_posix()
    SQLALCHEMY_BINDS = {
        "general": f"firebird+fdb://SYSDBA:masterkey@localhost:3050/{backend_path}/app/resources/database/general_aspel_example.fdb",
        "auth": f"firebird+fdb://SYSDBA:masterkey@localhost:3050/{backend_path}/app/resources/database/auth_aspel_example.fdb",
    }


class ProdConfig(Config):
    DEBUG: bool = False

    SQLALCHEMY_BINDS = {
        "general": os.getenv("GENERAL_DB_URI"),
        "auth": os.getenv("AUTH_DB_URI"),
    }


config_by_name: dict[str, type[Config]] = dict(
    development=DevConfig, production=ProdConfig
)
