package com.bamx.backend.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.when;

import com.bamx.backend.dtos.ProductLocationDto;
import com.bamx.backend.dtos.ProductWarehouseDto;
import com.bamx.backend.mappers.InveMapper;
import com.bamx.backend.models.Inve;
import com.bamx.backend.repositories.CLinRepository;
import com.bamx.backend.repositories.InveRepository;
import com.bamx.backend.repositories.LtpdRepository;
import com.bamx.backend.repositories.MultRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class InveServiceTest {

  @Mock private InveRepository inveRepository;
  @Mock private LtpdRepository ltpdRepository;
  @Mock private CLinRepository cLinRepository;
  @Mock private MultRepository multRepository;
  @Mock private InveMapper inveMapper;
  @InjectMocks private InveService inveService;

  private Inve producto(String cveArt, String descr, String uniMed, Double exist) {
    return Inve.builder().cveArt(cveArt).descr(descr).uniMed(uniMed).exist(exist).build();
  }

  // Las filas llegan como Object[] desde las @Query. COUNT en JPA devuelve Long,
  // así que los mocks lo replican para que el casteo del service quede probado.
  private Object[] lote(
      Integer cveAlm, String descr, Double cantidad, long lotes, long conCaducidad, LocalDateTime proxima) {
    return new Object[] {cveAlm, descr, cantidad, lotes, conCaducidad, proxima};
  }

  private List<Integer> idsDeAlmacen(ProductLocationDto location) {
    return location.getWarehouses().stream().map(ProductWarehouseDto::getWarehouse_id).toList();
  }

  @Test
  void uneLaExistenciaDeMultConLosLotesDeLtpd() {
    // Caso real de FRUT000GR: existencia en el almacén 3 (sin lote capturado) y
    // lotes en el 2 y el 6 que MULT no refleja. Ninguna fuente sola lo cubre.
    when(inveRepository.findById("FRUT000GR"))
        .thenReturn(Optional.of(producto("FRUT000GR", "FRUTA A GRANEL", "PZ", 57.7)));
    when(multRepository.findStockByProduct("FRUT000GR"))
        .thenReturn(List.<Object[]>of(new Object[] {3, "Almacén 3", 57.7}));
    when(ltpdRepository.findLotSummaryByProduct("FRUT000GR"))
        .thenReturn(
            List.of(
                lote(2, "Almacén 2", 50.0, 1L, 1L, LocalDateTime.of(2026, 5, 15, 0, 0)),
                lote(6, "Almacén 6", 200.0, 1L, 1L, LocalDateTime.of(2026, 6, 13, 0, 0))));

    ProductLocationDto location = inveService.getProductLocations("FRUT000GR");

    // Ordenados por cantidad visible descendente: 200 (lotes), 57.7 (MULT), 50.
    assertEquals(List.of(6, 3, 2), idsDeAlmacen(location));
    assertEquals("pz", location.getUnit());
    assertEquals(57.7, location.getTotal_quantity());

    ProductWarehouseDto soloMult = location.getWarehouses().get(1);
    assertEquals(57.7, soloMult.getStock_quantity());
    assertEquals(0, soloMult.getLots_count());
    assertNull(soloMult.getNearest_expiration());
  }

  @Test
  void marcaLosLotesQueNoTraenCaducidadCapturada() {
    // A006123: 2 lotes en el almacén 1, ninguno con FCHCADUC, y MULT en cero.
    when(inveRepository.findById("A006123"))
        .thenReturn(Optional.of(producto("A006123", "Atun en Aceite Herdez", "PZ", 0.0)));
    when(multRepository.findStockByProduct("A006123")).thenReturn(List.<Object[]>of());
    when(ltpdRepository.findLotSummaryByProduct("A006123"))
        .thenReturn(List.<Object[]>of(lote(1, "Almacén 1", 10.0, 2L, 0L, null)));

    ProductLocationDto location = inveService.getProductLocations("A006123");

    ProductWarehouseDto almacen = location.getWarehouses().get(0);
    assertEquals(10.0, almacen.getLots_quantity());
    assertEquals(2, almacen.getLots_count());
    assertEquals(2, almacen.getLots_without_expiration());
    assertNull(almacen.getNearest_expiration());
  }

  @Test
  void cuandoElAlmacenNoTieneNombreUsaElFallback() {
    when(inveRepository.findById("X")).thenReturn(Optional.of(producto("X", "X", "KG", 1.0)));
    when(multRepository.findStockByProduct("X"))
        .thenReturn(List.<Object[]>of(new Object[] {7, null, 5.0}));
    when(ltpdRepository.findLotSummaryByProduct("X")).thenReturn(List.<Object[]>of());

    ProductLocationDto location = inveService.getProductLocations("X");

    assertEquals("Almacén 7", location.getWarehouses().get(0).getWarehouse_name());
  }

  @Test
  void devuelveNullSiElProductoNoExiste() {
    when(inveRepository.findById("NOEXISTE")).thenReturn(Optional.empty());

    assertNull(inveService.getProductLocations("NOEXISTE"));
  }
}
