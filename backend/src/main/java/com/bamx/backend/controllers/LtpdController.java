package com.bamx.backend.controllers;

import com.bamx.backend.dtos.LoteConImagenDto;
import com.bamx.backend.dtos.response.ApiResponse;
import com.bamx.backend.dtos.response.PageResponse;
import com.bamx.backend.services.LtpdService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
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
  public ApiResponse getLotes(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size,
      @RequestParam(defaultValue = "fchCaduc") String sort,
      @RequestParam(defaultValue = "asc") String direction) {

    Sort.Order order =
        new Sort.Order(
            direction.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC,
            sort == null ? "fchCaduc" : sort);

    Pageable pageable = PageRequest.of(page, size, Sort.by(order));

    Page<LoteConImagenDto> result = ltpdService.findAll(pageable);

    HttpStatus status = HttpStatus.OK;
    return new ApiResponse(
        status.value(), "Lotes retrieved successfully", convertToPageResponse(result));
  }

  private PageResponse<LoteConImagenDto> convertToPageResponse(Page<LoteConImagenDto> page) {
    return new PageResponse<>(
        page.getContent(),
        page.getNumber(),
        page.getSize(),
        page.getTotalElements(),
        page.getTotalPages(),
        page.isLast());
  }
}
