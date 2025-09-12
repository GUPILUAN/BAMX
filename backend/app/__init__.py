from flask import Flask
from config import config_by_name, Config
from .controllers.auth_controller import auth_bp
from .controllers.inventory_controller import inventario_bp
from .extensions import jwt, db
from sqlalchemy.dialects import registry


def create_app(config_name: str = "development") -> Flask:
    registry.register("firebird.fdb", "sqlalchemy_firebird.fdb", "FBDialect_fdb")
    app: Flask = Flask(__name__)
    config_class: type[Config] = config_by_name.get(config_name, Config)
    app.config.from_object(config_class)
    jwt.init_app(app)
    db.init_app(app)

    # ---------- Healthcheck ----------
    @app.get("/api/health")
    def health() -> tuple[dict[str, str], int]:
        return {"status": "ok"}, 200

    # ---------- Blueprints ----------
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(inventario_bp, url_prefix="/api/inventario")

    return app
