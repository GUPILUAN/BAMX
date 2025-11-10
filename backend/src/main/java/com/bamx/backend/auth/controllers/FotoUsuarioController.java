package com.bamx.backend.auth.controllers;

import com.bamx.backend.auth.services.FotoUsuarioService;
import com.bamx.backend.security.CurrentUser;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/foto-usuario")
@RequiredArgsConstructor
public class FotoUsuarioController {

  private final FotoUsuarioService fotoUsuarioService;

  @GetMapping("/")
  public ResponseEntity<byte[]> getFotoUsuario(@CurrentUser Integer usuarioId) {
    byte[] bytes = fotoUsuarioService.getFotoByUsuarioId(usuarioId);
    return ResponseEntity.ok()
        .contentType(Objects.requireNonNull(MediaType.IMAGE_JPEG))
        .body(bytes);
  }
}
