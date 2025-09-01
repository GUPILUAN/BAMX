from ..models import Inventory

class InventoryRepository:
    def get_all(self):
        return Inventory.query.all()