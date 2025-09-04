from ..extensions import db


class Almacenes01(db.Model):
    __bind_key__ = "general"
    __tablename__ = "ALMACENES01"
    CVE_ALM = db.Column(db.Integer, primary_key=True)
    DESCR = db.Column(db.String(40))
    ENCARGADO = db.Column(db.String(60))
    TELEFONO = db.Column(db.String(16))
    LISTA_PREC = db.Column(db.Integer)
    CUEN_CONT = db.Column(db.String(28))
    CVE_MENT = db.Column(db.Integer)
    CVE_MSAL = db.Column(db.Integer)
    STATUS = db.Column(db.String(1))
    LAT = db.Column(db.Float)
    LON = db.Column(db.Float)
    UUID = db.Column(db.String(50))
    VERSION_SINC = db.Column(db.DateTime)
    UBI_DEST = db.Column(db.LargeBinary)
