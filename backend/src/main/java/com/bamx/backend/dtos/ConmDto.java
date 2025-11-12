package com.bamx.backend.dtos;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ConmDto {
  private Integer cveCpto;
  private String descr;
  private String cpn;
  private String cuenCont;
  private String tipoMov;
  private String status;
  private Short signo;
}
