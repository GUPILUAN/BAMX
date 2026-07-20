package com.bamx.backend.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.bamx.backend.dtos.LoteConImagenDto;
import com.bamx.backend.mappers.LtpdMapper;
import com.bamx.backend.repositories.LtpdRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

@ExtendWith(MockitoExtension.class)
class LtpdServiceTest {

  @Mock private LtpdRepository ltpdRepository;
  @Mock private LtpdMapper ltpdMapper;
  @InjectMocks private LtpdService ltpdService;

  private LoteConImagenDto lote(String id, LocalDateTime expiration, String image) {
    return LoteConImagenDto.builder()
        .product_id(id)
        .expiration_date(expiration)
        .image(image)
        .build();
  }

  private <T> Map<String, T> byProductId(
      List<LoteConImagenDto> lotes, Function<LoteConImagenDto, T> field) {
    when(ltpdRepository.findAllLotes(any(Pageable.class))).thenReturn(new PageImpl<>(lotes));
    return ltpdService.findAll(0, 10, "fchCaduc", "asc").getContent().stream()
        .collect(Collectors.toMap(LoteConImagenDto::getProduct_id, field));
  }

  @Test
  void rewritesStatusFromExpirationDate() {
    LocalDate today = LocalDate.now();
    Map<String, String> status =
        byProductId(
            List.of(
                lote("sin-caducidad", null, "x"),
                lote("hoy+1", today.plusDays(1).atStartOfDay(), "x"),
                lote("hoy+2", today.plusDays(2).atStartOfDay(), "x"),
                lote("hoy+5", today.plusDays(5).atStartOfDay(), "x"),
                lote("hoy+6", today.plusDays(6).atStartOfDay(), "x")),
            LoteConImagenDto::getStatus);

    // expiracion null y <= 2 dias => critical; 3-5 dias => warning; > 5 => good
    assertEquals("critical", status.get("sin-caducidad"));
    assertEquals("critical", status.get("hoy+1"));
    assertEquals("critical", status.get("hoy+2"));
    assertEquals("warning", status.get("hoy+5"));
    assertEquals("good", status.get("hoy+6"));
  }

  @Test
  void buildsRelativeImageUrlAndFallsBackWhenMissing() {
    LocalDateTime good = LocalDate.now().plusDays(10).atStartOfDay();
    Map<String, String> image =
        byProductId(
            List.of(lote("con-imagen", good, "FRUT000GR.jpg"), lote("sin-imagen", good, null)),
            LoteConImagenDto::getImage);

    // Ruta relativa (el frontend antepone su baseURL), no acoplada al host del backend.
    assertEquals("/api/public/fotos-inventarios/FRUT000GR.jpg", image.get("con-imagen"));
    // Sin imagen => placeholder externo absoluto.
    assertTrue(image.get("sin-imagen").startsWith("https://"));
  }

  @Test
  void defaultFindAllDoesNotFilterByDeliverability() {
    // El Semáforo usa la firma de 4 args -> findAllLotes sin filtro de entregabilidad.
    when(ltpdRepository.findAllLotes(any(Pageable.class)))
        .thenReturn(
            new PageImpl<>(List.of(lote("x", LocalDate.now().plusDays(10).atStartOfDay(), "x"))));

    ltpdService.findAll(0, 10, "fchCaduc", "asc");

    verify(ltpdRepository).findAllLotes(any(Pageable.class));
    verify(ltpdRepository, never()).findDeliverableLotes(any(LocalDateTime.class), any());
    verify(ltpdRepository, never()).findNotDeliverableLotes(any(LocalDateTime.class), any());
  }

  @Test
  void fitForDeliveryTrueUsesDeliverableQueryWithMidnightOfTodayPlus3Cutoff() {
    LocalDateTime expectedCutoff = LocalDate.now().plusDays(3).atStartOfDay();
    when(ltpdRepository.findDeliverableLotes(any(LocalDateTime.class), any(Pageable.class)))
        .thenReturn(
            new PageImpl<>(
                List.of(
                    lote("warning", LocalDate.now().plusDays(4).atStartOfDay(), "x"),
                    lote("good", LocalDate.now().plusDays(10).atStartOfDay(), "x"))));

    var result = ltpdService.findAll(0, 10, "fchCaduc", "asc", true);

    ArgumentCaptor<LocalDateTime> cutoff = ArgumentCaptor.forClass(LocalDateTime.class);
    verify(ltpdRepository).findDeliverableLotes(cutoff.capture(), any(Pageable.class));
    verify(ltpdRepository, never()).findAllLotes(any(Pageable.class));
    assertEquals(expectedCutoff, cutoff.getValue());

    Map<String, String> status =
        result.getContent().stream()
            .collect(
                Collectors.toMap(LoteConImagenDto::getProduct_id, LoteConImagenDto::getStatus));
    assertEquals("warning", status.get("warning"));
    assertEquals("good", status.get("good"));
  }

  @Test
  void fitForDeliveryFalseUsesNotDeliverableQuery() {
    when(ltpdRepository.findNotDeliverableLotes(any(LocalDateTime.class), any(Pageable.class)))
        .thenReturn(
            new PageImpl<>(
                List.of(
                    lote("sin-caducidad", null, "x"),
                    lote("caducado", LocalDate.now().minusDays(1).atStartOfDay(), "x"))));

    var result = ltpdService.findAll(0, 10, "fchCaduc", "asc", false);

    verify(ltpdRepository).findNotDeliverableLotes(any(LocalDateTime.class), any(Pageable.class));
    verify(ltpdRepository, never()).findAllLotes(any(Pageable.class));

    Map<String, String> status =
        result.getContent().stream()
            .collect(
                Collectors.toMap(LoteConImagenDto::getProduct_id, LoteConImagenDto::getStatus));
    // El rewrite de status sigue aplicando aunque el filtrado lo haga la query.
    assertEquals("critical", status.get("sin-caducidad"));
    assertEquals("critical", status.get("caducado"));
  }
}
