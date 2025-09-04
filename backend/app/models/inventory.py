from ..extensions import db


class Inve01(db.Model):
    __bind_key__ = "general"
    __tablename__ = "INVE01"

    CVE_ART = db.Column(db.String(16), primary_key=True)
    DESCR = db.Column(db.String(100))
    LIN_PROD = db.Column(db.String(10))
