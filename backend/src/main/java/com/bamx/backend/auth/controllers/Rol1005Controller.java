package com.bamx.backend.auth.controllers;

import com.bamx.backend.auth.models.Rol1005;
import com.bamx.backend.auth.services.Rol1005Service;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class Rol1005Controller {
  private final Rol1005Service rol1005Service;

  @GetMapping("/")
  public ResponseEntity<List<Rol1005>> getAllRoles() {
    return ResponseEntity.ok(rol1005Service.getAllRoles());
  }
}
