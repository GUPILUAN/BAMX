package com.bamx.backend.controllers;

import com.bamx.backend.dtos.AlmacenDto;
import com.bamx.backend.services.AlmacenService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/almacenes")
@RequiredArgsConstructor
public class AlmacenController {
  private final AlmacenService almacenService;

  @GetMapping("/")
  public ResponseEntity<List<AlmacenDto>> getAllAlmacenes() {
    return ResponseEntity.ok(almacenService.getAllAlmacenes());
  }

  @GetMapping("/ping")
  public ResponseEntity<String> ping() {
    return ResponseEntity.ok("pong");
  }
}
