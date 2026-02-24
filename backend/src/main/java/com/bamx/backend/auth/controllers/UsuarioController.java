package com.bamx.backend.auth.controllers;

import com.bamx.backend.auth.dtos.InfoUsuario;
import com.bamx.backend.auth.services.UsuarioService;
import com.bamx.backend.dtos.request.LoginRequest;
import com.bamx.backend.dtos.response.ApiResponse;
import com.bamx.backend.dtos.response.LoginResponse;
import com.bamx.backend.security.CurrentUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@Slf4j
public class UsuarioController {
  private final UsuarioService usuarioService;

  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody @Valid LoginRequest loginRequest) {
    log.debug("USERNAME: {}", loginRequest.getUsername());
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

  @GetMapping("/me")
  public ApiResponse getCurrentUsuario(@CurrentUser Integer id) {
    HttpStatus status = HttpStatus.OK;
    InfoUsuario usuarioInfo = usuarioService.findById(id);
    return new ApiResponse(status.value(), "User info retrieved successfully", usuarioInfo);
  }
}
