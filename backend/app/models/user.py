from ..extensions import db
from sqlalchemy.orm import relationship, mapped_column, Mapped
from sqlalchemy import Integer, String


class Usuario(db.Model):
    __bind_key__ = "auth"
    __tablename__ = "USUARIOS"

    IDUSR: Mapped[int] = mapped_column(Integer, primary_key=True, nullable=False)
    NOMBRE: Mapped[str] = mapped_column(String(80))
    USUARIO: Mapped[str] = mapped_column(String(15))
    PASS: Mapped[str] = mapped_column(String(20))
    ESTADO: Mapped[str] = mapped_column(Integer)
    PUESTO: Mapped[str] = mapped_column(String(30))
    DEPTO: Mapped[str] = mapped_column(String(30))
    MAIL: Mapped[str] = mapped_column(String(80))

    # relaciones
    FOTO = relationship("FotoUsuario", uselist=False, back_populates="USUARIO")
    EMPRESAS = relationship("UsrEmp", back_populates="USUARIO")

    def __init__(self, NOMBRE, USUARIO, PASS, ESTADO, PUESTO, DEPTO, MAIL):
        self.NOMBRE = NOMBRE
        self.USUARIO = USUARIO
        self.PASS = PASS
        self.ESTADO = ESTADO
        self.PUESTO = PUESTO
        self.DEPTO = DEPTO
        self.MAIL = MAIL


class UsrEmp(db.Model):
    __bind_key__ = "auth"
    __tablename__ = "USREMP"

    IDUSREMP = db.Column(db.Integer, primary_key=True, nullable=False)
    IDUSR = db.Column(db.Integer, db.ForeignKey("USUARIOS.IDUSR"), nullable=False)
    IDSIST = db.Column(db.Integer, nullable=False)
    EMPRESA = db.Column(db.String(100), nullable=False)
    IDROL = db.Column(db.Integer, db.ForeignKey("ROL001005.IDROL"), nullable=False)
    STATUS = db.Column(db.String(20), nullable=False)

    # relaciones
    USUARIO = db.relationship("Usuario", back_populates="EMPRESAS")
    ROL = db.relationship("Rol001005", back_populates="USUARIOS_EMP")
