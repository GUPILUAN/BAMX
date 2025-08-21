from flask import Flask
from config import config_by_name, Config
from app.controllers.database_controller import database_bp, init_database_controller
from app.repositories.database_repository import DatabaseRepository
from app.services.database_service import DatabaseService
from app.extensions import engine


def create_app(config_name: str = "development") -> Flask:
    app: Flask = Flask(__name__)
    config_class: type[Config] = config_by_name.get(config_name, Config)
    app.config.from_object(config_class)

    # ---------- Healthcheck ----------
    @app.get("/api/health")
    def health() -> tuple[dict[str, str], int]:
        return {"status": "ok"}, 200

    # ---------- Inyección de dependencias ----------
    repository: DatabaseRepository = DatabaseRepository(engine)
    db_service: DatabaseService = DatabaseService(
        repository, app.config["SQLALCHEMY_DATABASE_URI"]
    )

    # Pasamos el servicio al controlador
    init_database_controller(db_service)
    app.register_blueprint(database_bp, url_prefix="/api/databases")

    return app
