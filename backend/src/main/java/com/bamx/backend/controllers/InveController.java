package com.bamx.backend.controllers;

import com.bamx.backend.dtos.InventoryItem;
import com.bamx.backend.dtos.response.ApiResponse;
import com.bamx.backend.services.InveService;
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
@RequestMapping("/api/inventarios")
@RequiredArgsConstructor
public class InveController {
  private final InveService inveService;

  @GetMapping("/")
  public ResponseEntity<ApiResponse> getAllInve(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(defaultValue = "linProd") String sort,
      @RequestParam(defaultValue = "") String search,
      @RequestParam(defaultValue = "asc") String direction) {
    HttpStatus status = HttpStatus.OK;
    Page<InventoryItem> result = inveService.getAllInve(page, size, sort, direction, search);
    return new ResponseEntity<>(
        new ApiResponse(
            status.value(),
            "Inventory retrieved successfully",
            PageableUtils.convertToPageResponse(result)),
        status);
  }
}
