package com.bamx.backend.models;

import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MInveId implements Serializable {

  private String cveArt; // Article Key
  private Integer almacen; // Warehouse Key
  private Integer numMov; // Movement Number Key [Table ID = 44 in TBLCONTROL for new records]
  private Integer cveCpto; // Concept Key
}
