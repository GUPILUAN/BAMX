package com.bamx.backend.controllers;

import com.bamx.backend.dtos.AlmacenDto;
import com.bamx.backend.dtos.response.ApiResponse;
import com.bamx.backend.services.AlmacenService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/almacenes")
@RequiredArgsConstructor
public class AlmacenController {
  private final AlmacenService almacenService;

  @GetMapping("/all")
  public ResponseEntity<List<AlmacenDto>> getAllAlmacenes() {
    return ResponseEntity.ok(almacenService.getAllAlmacenes());
  }

  @GetMapping("/dashboard")
  public ResponseEntity<ApiResponse> getAlmacenDashboard() {
    HttpStatus status = HttpStatus.OK;
    ApiResponse response =
        new ApiResponse(
            status.value(),
            "Almacenes dashboard data retrieved successfully",
            almacenService.getDashboard());
    return ResponseEntity.status(status).body(response);
  }
}
