package com.bamx.backend.dtos;

import java.util.List;
import lombok.*;

@Data
@Builder
public class InventoryItem {
  private String id;
  private String name;
  private String type;
  private Double available_quantity;
  private String unit;
  private List<String> warehouseNamesCritical;
  private List<String> warehouseNamesWarning;
  private List<String> warehouseNamesGood;
}
