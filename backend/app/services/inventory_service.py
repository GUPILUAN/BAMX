from ..repositories.inventory_repository import InventoryRepository
from ..dto import InventoryItemDTO


class InventoryService:
    def __init__(self, repository: InventoryRepository):
        self._repository = repository

    def inventory_list(self) -> list[dict]:
        return [
            InventoryItemDTO(
                product_id=item.product_id,
                product_name=item.product_name,
                lot=item.lot,
                available_quantity=item.available_quantity,
                production_date=item.production_date,
                expiration_date=item.expiration_date,
                last_movement=item.last_movement,
                warehouse=item.warehouse,
                status=item.status,
                type=item.type,
            ).__dict__
            for item in self._repository.get_all()
        ]
