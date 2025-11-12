package com.bamx.backend.dtos;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CvesAlterDto {
  private String cveArt;
  private String cveAlter;
  private String tipo;
  private String cveClpv;
}
