from ..extensions import db


class Usuario(db.Model):
    __bind_key__ = "auth"
    __tablename__ = "USUARIOS"

    IDUSR = db.Column(db.Integer, primary_key=True, nullable=False)
    NOMBRE = db.Column(db.String(80))
    USUARIO = db.Column(db.String(15))
    PASS = db.Column(db.String(20))
    ESTADO = db.Column(db.Integer)
    PUESTO = db.Column(db.String(30))
    DEPTO = db.Column(db.String(30))
    MAIL = db.Column(db.String(80))

    # relaciones
    foto = db.relationship("FotoUsuario", uselist=False, back_populates="usuario")
    empresas = db.relationship("UsrEmp", back_populates="usuario")

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
    usuario = db.relationship("Usuario", back_populates="empresas")
    rol = db.relationship("Rol001005", back_populates="usuarios_emp")
