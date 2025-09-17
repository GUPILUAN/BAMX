from ..extensions import db
from ..utils import BlobText


class FotoUsuario(db.Model):
    __bind_key__ = "auth"
    __tablename__ = "FOTOUSUARIO"

    IDUSR = db.Column(
        db.Integer, db.ForeignKey("USUARIOS.IDUSR"), primary_key=True, nullable=False
    )
    FOTOGRAFIA = db.Column(BlobText)

    USUARIO = db.relationship("Usuario", back_populates="FOTO")

    def __init__(self, IDUSR, FOTOGRAFIA):
        self.IDUSR = IDUSR
        self.FOTOGRAFIA = FOTOGRAFIA
