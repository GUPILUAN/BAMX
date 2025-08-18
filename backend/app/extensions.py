from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from config import Config

engine: Engine = create_engine(
    Config.SQLALCHEMY_DATABASE_URI, echo=Config.SQLALCHEMY_ECHO
)
