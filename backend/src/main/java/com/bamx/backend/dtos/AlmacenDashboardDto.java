package com.bamx.backend.dtos;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AlmacenDashboardDto {

  private Integer id;
  private String name;
  private boolean active;
  private LocalDateTime last_update;
  private List<String> labels;
  private List<List<Long>> data;
  private double temperature;
  private boolean refrigerated;
}
