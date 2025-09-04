from ..extensions import db


class User(db.Model):
    __bind_key__ = "auth"
    __tablename__ = "USUARIOS"

    IDUSR = db.Column(
        db.Integer, primary_key=True, nullable=False
    )  # INTEGER(4), PK, NOT NULL
    NOMBRE = db.Column(db.String(80), nullable=True)  # VARCHAR(80), Nullable
    USUARIO = db.Column(db.String(15), nullable=True)  # VARCHAR(15), Nullable
    PASS = db.Column(db.String(20), nullable=True)  # VARCHAR(20), Nullable
    ESTADO = db.Column(db.Integer, nullable=True)  # INTEGER(4), Nullable
    PUESTO = db.Column(db.String(30), nullable=True)  # VARCHAR(30), Nullable
    DEPTO = db.Column(db.String(30), nullable=True)  # VARCHAR(30), Nullable
    MAIL = db.Column(db.String(80), nullable=True)  # VARCHAR(80), Nullable

    def __init__(self, NOMBRE, USUARIO, PASS, ESTADO, PUESTO, DEPTO, MAIL):
        self.NOMBRE = NOMBRE
        self.USUARIO = USUARIO
        self.PASS = PASS
        self.ESTADO = ESTADO
        self.PUESTO = PUESTO
        self.DEPTO = DEPTO
        self.MAIL = MAIL
