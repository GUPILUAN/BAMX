package com.bamx.backend.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.when;

import com.bamx.backend.dtos.ProductLocationDto;
import com.bamx.backend.dtos.response.ApiResponse;
import com.bamx.backend.services.InveService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
class InveControllerTest {

  @Mock private InveService inveService;
  @InjectMocks private InveController inveController;

  @Test
  void devuelveLosAlmacenesDelProducto() {
    ProductLocationDto location =
        ProductLocationDto.builder()
            .product_id("VEDU000GR")
            .product_name("VERDURA A GRANEL")
            .unit("KG")
            .total_quantity(267.02)
            .warehouses(List.of())
            .build();
    when(inveService.getProductLocations("VEDU000GR")).thenReturn(location);

    ResponseEntity<ApiResponse> response = inveController.getProductWarehouses("VEDU000GR");

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(200, response.getBody().getStatus());
    assertSame(location, response.getBody().getData());
  }

  @Test
  void responde404SiElProductoNoExiste() {
    // El service devuelve null en vez de lanzar: el controller lo traduce a 404
    // para que el detalle no confunda "no existe" con "no está en ningún almacén".
    when(inveService.getProductLocations("NO-EXISTE")).thenReturn(null);

    ResponseEntity<ApiResponse> response = inveController.getProductWarehouses("NO-EXISTE");

    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    assertEquals(404, response.getBody().getStatus());
    assertNull(response.getBody().getData());
  }
}
