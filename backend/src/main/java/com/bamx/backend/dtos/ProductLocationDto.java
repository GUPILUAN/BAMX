package com.bamx.backend.dtos;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Respuesta de GET /api/inventarios/{cveArt}/almacenes: dónde está un producto. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductLocationDto {
  private String product_id;
  private String product_name;
  private String unit;

  // INVE.EXIST, la existencia maestra. Aspel la mantiene como suma de MULT, así
  // que sirve de control contra el desglose por almacén.
  private Double total_quantity;

  private List<ProductWarehouseDto> warehouses;
}
