package com.bamx.backend.dtos;

import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AlmacenDashboardDto {

  private Integer id;
  private String name;
  private boolean active;
  private Object last_update;
  private List<String> labels;
  private List<List<Long>> data;
  private double temperature;
}
