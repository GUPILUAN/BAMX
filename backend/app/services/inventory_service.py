from ..repositories.inventory_repository import InventoryRepository
class InventoryService:
    def __init__(self, repository: InventoryRepository):
        self._repository = repository

    def listar_inventario(self):
        return self._repository.get_all()
