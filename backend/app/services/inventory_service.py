from ..repositories.inventory_repository import InventoryRepository


class InventoryService:
    def __init__(self, repository: InventoryRepository):
        self._repository = repository

    def listar_inventario(self) -> list[dict]:
        return [
            {
                "product_id": item.product_id,
                "product_name": item.product_name,
                "lot": item.lot,
                "available_quantity": item.available_quantity,
                "production_date": (
                    item.production_date.isoformat() if item.production_date else None
                ),
                "expiration_date": (
                    item.expiration_date.isoformat() if item.expiration_date else None
                ),
                "last_movement": (
                    item.last_movement.isoformat() if item.last_movement else None
                ),
                "warehouse": item.warehouse,
                "status": item.status,
                "type": item.type,
            }
            for item in self._repository.get_all()
        ]
