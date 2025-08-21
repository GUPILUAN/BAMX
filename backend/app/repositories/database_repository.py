from typing import List
from sqlalchemy import text
from sqlalchemy.engine import Engine


class DatabaseRepository:
    def __init__(self, engine: Engine) -> None:
        self._engine = engine

    def get_databases(self, db_url: str) -> List[str]:
        """
        Obtiene la lista de bases de datos dependiendo del motor.
        """
        if db_url.startswith("mysql"):
            query: str = "SHOW DATABASES;"
        elif db_url.startswith("postgresql"):
            query: str = "SELECT datname FROM pg_database WHERE datistemplate = false;"
        elif db_url.startswith("firebird"):
            query: str = "SELECT rdb$database FROM rdb$database;"
        elif db_url.startswith("sqlite"):
            return ["sqlite_database"]
        else:
            raise ValueError("Motor de base de datos no soportado")

        with self._engine.connect() as conn:
            result = conn.execute(text(query))
            return [row[0] for row in result]
