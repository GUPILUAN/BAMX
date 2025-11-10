package com.bamx.backend.models;

import java.io.Serializable;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NumSerId implements Serializable {

  private String cveArt; // Article Key
  private String numSer; // Serial Number
  private Integer almacen; // Warehouse Key
}
