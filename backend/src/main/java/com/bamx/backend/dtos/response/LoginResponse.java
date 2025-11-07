package com.bamx.backend.dtos.response;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
public class LoginResponse {
  private String access;
  private String refresh;
}
