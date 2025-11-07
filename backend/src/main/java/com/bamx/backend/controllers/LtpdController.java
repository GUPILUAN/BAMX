package com.bamx.backend.controllers;

import com.bamx.backend.dtos.LtpdDto;
import com.bamx.backend.services.LtpdService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/lotes")
@RequiredArgsConstructor
public class LtpdController {
  private final LtpdService ltpdService;

  @GetMapping("/")
  public ResponseEntity<List<LtpdDto>> getAllLtpd() {
    return ResponseEntity.ok(ltpdService.getAllLtpd());
  }
}
