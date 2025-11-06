class WarehouseDTO:
    def __init__(self, id: str, products: list[dict]):
        self.id = id
        self.products = products
