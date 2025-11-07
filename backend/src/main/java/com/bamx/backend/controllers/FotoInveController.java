package com.bamx.backend.controllers;

import com.bamx.backend.dtos.FotoInveDto;
import com.bamx.backend.services.FotoInveService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/fotos-inventarios")
@RequiredArgsConstructor
public class FotoInveController {
  private final FotoInveService fotoInveService;

  @GetMapping("/")
  public ResponseEntity<List<FotoInveDto>> getAllFotoInve() {
    return ResponseEntity.ok(fotoInveService.getAllFotoInve());
  }
}
