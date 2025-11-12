package com.bamx.backend.dtos;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TblControlDto {
  private Integer idTabla;
  private Integer ultCve;
}
