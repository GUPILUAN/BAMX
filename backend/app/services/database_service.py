from typing import List
from app.repositories.database_repository import DatabaseRepository


class DatabaseService:
    def __init__(self, repository: DatabaseRepository, db_url: str) -> None:
        self._repository: DatabaseRepository = repository
        self._db_url: str = db_url

    def listar_bases(self) -> List[str]:
        """
        Devuelve la lista de bases de datos disponibles.
        """
        return self._repository.get_databases(self._db_url)
