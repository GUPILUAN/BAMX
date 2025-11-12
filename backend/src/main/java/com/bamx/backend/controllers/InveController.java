package com.bamx.backend.controllers;

import com.bamx.backend.dtos.InveDto;
import com.bamx.backend.services.InveService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inventarios")
@RequiredArgsConstructor
public class InveController {
  private final InveService inveService;

  @GetMapping("/")
  public ResponseEntity<List<InveDto>> getAllInve() {
    return ResponseEntity.ok(inveService.getAllInve());
  }
}
