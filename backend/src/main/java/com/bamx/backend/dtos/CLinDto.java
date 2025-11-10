package com.bamx.backend.dtos;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CLinDto {
  private String cveLin;
  private String descLin;
  private String esUnGpo;
  private String cuentaCoi;
  private String status;
}
