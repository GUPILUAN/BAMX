package com.bamx.backend.dtos;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MultDto {
  private String cveArt;
  private Integer cveAlm;
  private String status;
  private String ctrlAlm;
  private Double exist;
  private Double stockMin;
  private Double stockMax;
  private Double compXRec;
  private String uuid;
  private LocalDateTime versionSinc;
}
