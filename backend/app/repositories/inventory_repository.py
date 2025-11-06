from ..models import Inve01, Ltpd01


class InventoryRepository:
    def get_all(self) -> list:
        return (
            Inve01.query.session.query(
                Inve01.CVE_ART.label("product_id"),
                Inve01.DESCR.label("product_name"),
                Ltpd01.LOTE.label("lot"),
                Ltpd01.CANTIDAD.label("available_quantity"),
                Ltpd01.FEC_PROD_LT.label("production_date"),
                Ltpd01.FCHCADUC.label("expiration_date"),
                Ltpd01.FCHULTMOV.label("last_movement"),
                Ltpd01.CVE_ALM.label("warehouse"),
                Ltpd01.STATUS.label("status"),
                Inve01.LIN_PROD.label("type"),
            )
            .join(Ltpd01, Inve01.CVE_ART == Ltpd01.CVE_ART)
            .filter(Ltpd01.STATUS == "A")  # Only active batches
            .order_by(Inve01.CVE_ART, Ltpd01.LOTE)
            .all()
        )
