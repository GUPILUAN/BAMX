package com.bamx.backend.dtos;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EnlaceLtpdDto {
  private Integer e_Ltpd;
  private Integer regLtpd;
  private Double cantidad;
  private Double pxrs;
}
