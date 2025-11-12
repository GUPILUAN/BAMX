package com.bamx.backend.models;

import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MultId implements Serializable {
  private String cveArt; // Article Key
  private Integer cveAlm; // Warehouse Key
}
