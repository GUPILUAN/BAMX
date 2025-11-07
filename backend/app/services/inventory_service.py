from ..models.inventory import Inve01
from ..repositories.inventory_repository import InventoryRepository
from ..dto import InventoryItemDTO, ApiResponse, RegisterProductDTO


class InventoryService:
    def __init__(self, repository: InventoryRepository):
        self._repository = repository

    def inventory_list(self) -> tuple[dict, int]:
        return (
            ApiResponse(
                message="Inventario obtenido exitosamente",
                success=True,
                data={
                    "items": [
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
                },
            ).__dict__,
            200,
        )

    def register_product(self, inventory_data: RegisterProductDTO) -> tuple[dict, int]:
        try:
            new_product = Inve01()
            new_product.CVE_ART = inventory_data.CVE_ART
            new_product.DESCR = inventory_data.DESCR
            new_product.LIN_PROD = inventory_data.LIN_PROD
            self._repository.save_product(new_product)
            return (
                ApiResponse(
                    message="Producto registrado exitosamente",
                    success=True,
                    data={"product_id": new_product.CVE_ART},
                ).__dict__,
                201,
            )
        except Exception as e:
            return (
                ApiResponse(
                    message=f"Error al registrar el producto: {str(e)}",
                    success=False,
                ).__dict__,
                500,
            )
