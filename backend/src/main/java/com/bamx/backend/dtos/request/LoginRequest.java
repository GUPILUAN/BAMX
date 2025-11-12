package com.bamx.backend.dtos.request;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
public class LoginRequest {
  private String username;
  private String password;
}
