package com.bamx.backend.dtos;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NumSerDto {
  private String cveArt;
  private String numSer;
  private Integer almacen;
  private String status;
  private Double costo;
  private String doctoEnt;
  private LocalDateTime fechaEnt;
}
