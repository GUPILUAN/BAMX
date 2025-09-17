from ..extensions import db


class Rol001005(db.Model):
    __bind_key__ = "auth"
    __tablename__ = "ROL001005"

    IDROL = db.Column(db.Integer, primary_key=True, nullable=False)
    NOMBRE = db.Column(db.String(30))
    TIPO = db.Column(db.String(2), nullable=False)

    # relación inversa
    USUARIOS_EMP = db.relationship("UsrEmp", back_populates="ROL")

    def __init__(self, NOMBRE, TIPO):
        self.NOMBRE = NOMBRE
        self.TIPO = TIPO
