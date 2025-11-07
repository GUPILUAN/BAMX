package com.bamx.backend.dtos.response;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
public class ErrorResponse {

  private Integer status;
  private String message;
}
