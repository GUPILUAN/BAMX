package com.bamx.backend.dtos;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaisDto {
  private String cvePais;
  private String descr;
}
