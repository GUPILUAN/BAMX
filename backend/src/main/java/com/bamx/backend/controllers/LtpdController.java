package com.bamx.backend.controllers;

import com.bamx.backend.dtos.LoteConImagenDto;
import com.bamx.backend.dtos.response.ApiResponse;
import com.bamx.backend.services.LtpdService;
import com.bamx.backend.utils.PageableUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/lotes")
@RequiredArgsConstructor
public class LtpdController {
  private final LtpdService ltpdService;

  @GetMapping("/")
  public ResponseEntity<ApiResponse> getLotes(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size,
      @RequestParam(defaultValue = "fchCaduc") String sort,
      @RequestParam(defaultValue = "asc") String direction,
      @RequestParam(required = false) Boolean fitForDelivery) {

    Page<LoteConImagenDto> result =
        ltpdService.findAll(page, size, sort, direction, fitForDelivery);
    HttpStatus status = HttpStatus.OK;

    return new ResponseEntity<>(
        new ApiResponse(
            status.value(),
            "Lotes retrieved successfully",
            PageableUtils.convertToPageResponse(result)),
        status);
  }
}
