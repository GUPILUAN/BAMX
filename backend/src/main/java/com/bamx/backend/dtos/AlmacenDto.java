package com.bamx.backend.dtos;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AlmacenDto {
  private Integer cveAlm;
  private String descr;
  private String direccion;
  private String encargado;
  private String telefono;
  private Integer listaPrec;
  private String cuenCont;
  private Integer cveMent;
  private Integer cveMsal;
  private String status;
  private Double lat;
  private Double lon;
  private String uuid;
  private LocalDateTime versionSinc;
  private String ubiDest;
}
