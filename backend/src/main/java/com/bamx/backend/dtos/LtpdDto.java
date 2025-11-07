package com.bamx.backend.dtos;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LtpdDto {

  private Integer regLtpd;
  private String cveArt;
  private String lote;
  private String pedimento;
  private Integer cveAlm;
  private LocalDateTime fchCaduc;
  private LocalDateTime fchAduana;
  private LocalDateTime fchUltMov;
  private String nomAduan;
  private Double cantidad;
  private Integer cveObs;
  private String ciudad;
  private String frontera;
  private LocalDateTime fecProdLt;
  private String gln;
  private String status;
  private String pedimentoSat;
}
