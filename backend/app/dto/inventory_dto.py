class InventoryItemDTO:
    def __init__(
        self,
        product_id: str,
        product_name: str,
        lot: str,
        available_quantity: int,
        production_date=None,
        expiration_date=None,
        last_movement=None,
        warehouse: str = "",
        status: str = "",
        type: str = "",
    ):
        self.product_id = product_id
        self.product_name = product_name
        self.lot = lot
        self.available_quantity = available_quantity
        self.production_date = production_date.isoformat() if production_date else None
        self.expiration_date = expiration_date.isoformat() if expiration_date else None
        self.last_movement = last_movement.isoformat() if last_movement else None
        self.warehouse = warehouse
        self.status = status
        self.type = type
