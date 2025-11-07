package com.bamx.backend.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

public record DecodedToken(
    @NotNull String usuario,
    @NotBlank String rol,
    @NotBlank String empresa,
    @NotNull LocalDateTime issuedAt,
    @NotNull LocalDateTime expiration,
    @NotNull @NotBlank String jti,
    @NotNull @NotBlank String type,
    @NotNull @NotEmpty List<String> permissions) {

  public DecodedToken {
    if (issuedAt.isAfter(expiration)) {
      throw new IllegalArgumentException("issuedAt cannot be after expiration");
    }
  }

  public boolean isExpired() {
    return LocalDateTime.now().isAfter(expiration);
  }
}
