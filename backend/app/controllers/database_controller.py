from flask import Blueprint, jsonify, Response
from app.services.database_service import DatabaseService

database_bp: Blueprint = Blueprint("database", __name__)
_service: DatabaseService | None = None


def init_database_controller(service: DatabaseService) -> None:
    """
    Inyección de dependencia del servicio al controlador.
    """
    global _service
    _service = service


@database_bp.get("/")
def listar_bases() -> tuple[Response, int]:
    """
    Endpoint que devuelve todas las bases de datos disponibles.
    """
    try:
        assert _service is not None, "DatabaseService no inicializado"
        databases: list[str] = _service.listar_bases()
        return jsonify({"databases": databases}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
