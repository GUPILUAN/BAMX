package com.bamx.backend.auth.controllers;

import com.bamx.backend.auth.dtos.Rol1005Dto;
import com.bamx.backend.auth.models.Rol1005;
import com.bamx.backend.auth.services.Rol1005Service;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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

  @PostMapping("/")
  public ResponseEntity<Rol1005Dto> createNewRol(@RequestBody Rol1005Dto rol1005) {
    Rol1005Dto createdRol = rol1005Service.createNewRol(rol1005);
    return ResponseEntity.ok(createdRol);
  }
}
