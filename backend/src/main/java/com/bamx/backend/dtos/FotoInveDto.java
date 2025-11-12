package com.bamx.backend.dtos;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FotoInveDto {

  private String cveArt;
  private byte[] foto;
}
