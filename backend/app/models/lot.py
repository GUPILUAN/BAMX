from ..extensions import db


class Ltpd01(db.Model):
    __bind_key__ = "general"
    __tablename__ = "LTPD01"
    CVE_ART = db.Column(
        db.String(16), db.ForeignKey("INVE01.CVE_ART"), primary_key=True
    )
    LOTE = db.Column(db.String(12), primary_key=True)
    CANTIDAD = db.Column(db.Integer)
    FEC_PROD_LT = db.Column(db.DateTime)
    FCHCADUC = db.Column(db.DateTime)
    FCHULTMOV = db.Column(db.DateTime)
    PEDIMENTO = db.Column(db.String(21))
    PEDIMENTOSAT = db.Column(db.String(21))
    CVE_ALM = db.Column(db.Integer)
    STATUS = db.Column(db.String(1))
    INVENTARIO = db.relationship("Inve01", backref="LOTES")
