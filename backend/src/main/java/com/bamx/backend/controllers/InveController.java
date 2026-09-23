package com.bamx.backend.controllers;

import com.bamx.backend.dtos.InventoryItem;
import com.bamx.backend.dtos.ProductLocationDto;
import com.bamx.backend.dtos.response.ApiResponse;
import com.bamx.backend.services.InveService;
import com.bamx.backend.utils.PageableUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
      @RequestParam(defaultValue = "asc") String direction,
      @RequestParam(defaultValue = "true") boolean onlyWithStock) {
    HttpStatus status = HttpStatus.OK;
    Page<InventoryItem> result =
        inveService.getAllInve(page, size, sort, direction, search, onlyWithStock);
    return new ResponseEntity<>(
        new ApiResponse(
            status.value(),
            "Inventory retrieved successfully",
            PageableUtils.convertToPageResponse(result)),
        status);
  }

  // Desglose de en qué almacenes está un producto. Se consulta al abrir el
  // detalle, no dentro del listado, para no sumarse al N+1 que ya trae
  // getAllInve (3 queries de almacén por producto y página).
  @GetMapping("/{cveArt}/almacenes")
  public ResponseEntity<ApiResponse> getProductWarehouses(@PathVariable String cveArt) {
    ProductLocationDto data = inveService.getProductLocations(cveArt);
    if (data == null) {
      HttpStatus notFound = HttpStatus.NOT_FOUND;
      return new ResponseEntity<>(
          new ApiResponse(notFound.value(), "Product not found", null), notFound);
    }
    HttpStatus status = HttpStatus.OK;
    return new ResponseEntity<>(
        new ApiResponse(status.value(), "Product warehouses retrieved successfully", data), status);
  }
}
