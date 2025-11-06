from sqlalchemy import func
from ..models import Almacenes01, Ltpd01, Inve01


class WarehouseRepository:
    def get_all(self) -> list:
        return Almacenes01.query.all()

    def get_warehouse_by_id(self, warehouse_id: str) -> Almacenes01 | None:
        return Almacenes01.query.filter_by(CVE_ALM=warehouse_id).first()

    def get_all_product_lines_with_status(self) -> list:
        results = (
            Ltpd01.query.session.query(
                Almacenes01.CVE_ALM.label("warehouse_id"),
                Inve01.LIN_PROD.label("line"),
                Ltpd01.CANTIDAD.label("available_quantity"),
                Ltpd01.FCHCADUC.label("expiration_date"),
            )
            .join(Almacenes01, Ltpd01.CVE_ALM == Almacenes01.CVE_ALM)
            .join(Inve01, Ltpd01.CVE_ART == Inve01.CVE_ART)
            .filter(Ltpd01.STATUS == "A")  # Solo lotes activos
            .all()
        )
        return results

    def get_metrics_all_warehouses(self) -> list:
        results = (
            Ltpd01.query.session.query(
                Almacenes01.CVE_ALM.label("warehouse_id"),
                func.SUM(Ltpd01.CANTIDAD).label("total_quantity"),
                Ltpd01.FCHCADUC.label("expiration_date"),
            )
            .join(Almacenes01, Ltpd01.CVE_ALM == Almacenes01.CVE_ALM)
            .join(Inve01, Ltpd01.CVE_ART == Inve01.CVE_ART)
            .group_by(Almacenes01.CVE_ALM, Ltpd01.FCHCADUC)
            .filter(Ltpd01.STATUS == "A")  # Solo lotes activos
            .all()
        )
        return results
