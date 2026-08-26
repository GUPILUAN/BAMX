package com.bamx.backend.dtos;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Presencia de un producto en un almacén concreto. Una fila por CVE_ALM. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductWarehouseDto {
  private Integer warehouse_id;
  private String warehouse_name;

  // Existencia del catálogo multi-almacén (MULT.EXIST). Es la única fuente que
  // sigue funcionando para los productos sin lote capturado en Aspel.
  private Double stock_quantity;

  // Suma de LTPD.CANTIDAD de los lotes activos en este almacén. Puede diferir
  // de stock_quantity: Aspel lleva cantidad maestra y por lote por separado, y
  // en BAMX están desfasadas (ver CLAUDE.md, "Dos fuentes de verdad").
  private Double lots_quantity;

  private Integer lots_count;

  // Cuántos de esos lotes no traen FCHCADUC capturada. Es la fuga de captura
  // que documenta CLAUDE.md; exponerla evita que la UI finja que sí la hay.
  private Integer lots_without_expiration;

  private LocalDateTime nearest_expiration;
}
