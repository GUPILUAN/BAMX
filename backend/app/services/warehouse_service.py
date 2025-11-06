from ..repositories.warehouse_repository import WarehouseRepository
from ..dto import WarehouseDTO, ApiResponse
from datetime import date


class WarehouseService:

    def __init__(self, repository: WarehouseRepository):
        self._repository = repository

    def get_all_warehouses(self) -> list:
        return [
            WarehouseDTO(id=w.CVE_ALM, products=[]).__dict__
            for w in self._repository.get_all()
        ]

    def get_metrics_all_warehouses(self) -> tuple[dict, int]:
        results = self._repository.get_metrics_all_warehouses()
        today = date.today()

        output = {
            "critical": 0,
            "warning": 0,
            "normal": 0,
        }
        for r in results:
            total_quantity = r.total_quantity or 0
            expiration = r.expiration_date

            exp_date = expiration.date() if hasattr(expiration, "date") else expiration
            days_left = (exp_date - today).days if exp_date else None

            if days_left is None:
                status = "critical"
            elif days_left < 2:
                status = "critical"
            elif 2 <= days_left <= 5:
                status = "warning"
            else:
                status = "normal"

            if status:
                output[status] += total_quantity

        return (
            ApiResponse(
                message="Métricas de todos los almacenes obtenidas exitosamente",
                success=True,
                data=output,
            ).__dict__,
            200,
        )

    def warehouses_with_products(self) -> tuple[dict, int]:
        results = self._repository.get_all_product_lines_with_status()
        today = date.today()

        grouped = {}  # (almacén, línea) -> contadores por estado

        for r in results:
            warehouse_id = r.warehouse_id
            line = r.line
            expiration = r.expiration_date
            qty = r.available_quantity or 0

            key = (warehouse_id, line)

            exp_date = expiration.date() if hasattr(expiration, "date") else expiration
            days_left = (exp_date - today).days if exp_date else None

            if days_left is None:
                status = 2
            elif days_left < 2:
                status = 2
            elif 2 <= days_left <= 5:
                status = 1
            else:
                status = 0

            # Inicializar si no existe
            if key not in grouped:
                grouped[key] = {
                    "id": warehouse_id,
                    "line": line,
                    "status_counts": [0, 0, 0],  # [normal, near expiration, expired]
                }

            # Sumar la cantidad en el estado correspondiente
            if status is not None:
                grouped[key]["status_counts"][status] += qty
                print(f"Almacén: {grouped[key]['status_counts']}")

        # Convertir a lista para la respuesta
        results = list(grouped.values())
        categorias_por_almacen = {
            item["id"]: [x["line"] for x in results if x["id"] == item["id"]]
            for item in results
        }
        status_counts_por_categoria = {
            item["id"]: [x["status_counts"] for x in results if x["id"] == item["id"]]
            for item in results
        }

        for item in results:
            item["labels"] = categorias_por_almacen[item["id"]]
            item["data"] = status_counts_por_categoria[item["id"]]
            del item["line"]
            del item["status_counts"]

        output = list({v["id"]: v for v in results}.values())

        return (
            ApiResponse(
                message="Líneas de producto por almacén obtenidas exitosamente",
                success=True,
                data={"warehouses": output},
            ).__dict__,
            200,
        )
