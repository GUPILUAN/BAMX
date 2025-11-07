package com.bamx.backend.auth.controllers;

import com.bamx.backend.auth.dtos.InfoUsuario;
import com.bamx.backend.auth.services.UsuarioService;
import com.bamx.backend.dtos.request.LoginRequest;
import com.bamx.backend.dtos.response.ApiResponse;
import com.bamx.backend.dtos.response.LoginResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {
  private final UsuarioService usuarioService;

  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody @Valid LoginRequest loginRequest) {
    LoginResponse loginResponse = usuarioService.login(loginRequest);
    return ResponseEntity.ok(loginResponse);
  }

  @PostMapping("/logout")
  public ResponseEntity<ApiResponse> logout(@RequestHeader("Authorization") String authHeader) {
    boolean result = usuarioService.logout(authHeader);
    HttpStatus status = result ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
    String message = result ? "Logout successful" : "Logout failed";
    return ResponseEntity.status(status).body(new ApiResponse(status.value(), message, result));
  }

  @PostMapping("/refresh-token")
  public ResponseEntity<LoginResponse> refreshToken(
      @RequestHeader("Authorization") String refreshToken) {
    LoginResponse loginResponse = usuarioService.refreshToken(refreshToken);
    return ResponseEntity.ok(loginResponse);
  }

  @GetMapping("/{id}")
  public InfoUsuario getUsuarioById(@PathVariable @NonNull Integer id) {
    return usuarioService.findById(id);
  }
}
