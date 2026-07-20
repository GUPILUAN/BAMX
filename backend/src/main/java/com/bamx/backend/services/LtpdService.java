package com.bamx.backend.services;

import com.bamx.backend.dtos.LoteConImagenDto;
import com.bamx.backend.dtos.LtpdDto;
import com.bamx.backend.mappers.LtpdMapper;
import com.bamx.backend.repositories.LtpdRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LtpdService {
  private final LtpdRepository ltpdRepository;
  private final LtpdMapper ltpdMapper;

  /** Sin filtro de entregabilidad: lo usa el Semáforo (Home). No tocar el comportamiento. */
  public Page<LoteConImagenDto> findAll(int page, int size, String sortBy, String sortDir) {
    return findAll(page, size, sortBy, sortDir, null);
  }

  /**
   * @param fitForDelivery {@code null} = todos los lotes (Semáforo); {@code true} = solo
   *     entregables (verde+amarillo); {@code false} = solo no aptos (rojo: caducados, por caducar o
   *     sin caducidad capturada).
   */
  public Page<LoteConImagenDto> findAll(
      int page, int size, String sortBy, String sortDir, Boolean fitForDelivery) {
    Sort.Order order =
        new Sort.Order(
            sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC,
            sortBy == null ? "fchCaduc" : sortBy);
    Pageable pageable = PageRequest.of(page, size, Sort.by(order));
    LocalDate today = LocalDate.now();

    Page<LoteConImagenDto> pages;
    if (fitForDelivery == null) {
      pages = ltpdRepository.findAllLotes(pageable);
    } else {
      // Entregable <=> "days > 2" en la clasificación de abajo. Como days se calcula truncando la
      // caducidad a fecha, la frontera cae exacta en la medianoche de hoy+3.
      LocalDateTime deliverableCutoff = today.plusDays(3).atStartOfDay();
      pages =
          fitForDelivery
              ? ltpdRepository.findDeliverableLotes(deliverableCutoff, pageable)
              : ltpdRepository.findNotDeliverableLotes(deliverableCutoff, pageable);
    }

    return pages.map(
        dto -> {
          if (dto.getExpiration_date() == null) {
            dto.setStatus("critical");
          } else {
            long days = ChronoUnit.DAYS.between(today, dto.getExpiration_date());

            if (days <= 2) {
              dto.setStatus("critical");
            } else if (days <= 5) {
              dto.setStatus("warning");
            } else {
              dto.setStatus("good");
            }
          }

          if (dto.getImage() != null) {
            // Ruta relativa: el frontend le antepone su baseURL. Así la URL de
            // imagen no queda acoplada al host/túnel por el que se accede al backend.
            dto.setImage("/api/public/fotos-inventarios/" + dto.getImage());
          } else {
            dto.setImage(
                "https://png.pngtree.com/png-vector/20221125/ourlarge/pngtree-no-image-available-icon-flatvector-illustration-pic-design-profile-vector-png-image_40966566.jpg");
          }
          return dto;
        });
  }

  public List<LtpdDto> getAllLtpd() {
    return ltpdMapper.toDtoList(ltpdRepository.findAll());
  }
}
