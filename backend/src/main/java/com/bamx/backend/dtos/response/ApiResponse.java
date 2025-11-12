package com.bamx.backend.dtos.response;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
public class ApiResponse {
  private Integer status;
  private String message;
  private Object data;
}
