package com.bamx.backend.services;

import com.bamx.backend.dtos.LoteConImagenDto;
import com.bamx.backend.dtos.LtpdDto;
import com.bamx.backend.mappers.LtpdMapper;
import com.bamx.backend.repositories.LtpdRepository;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
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

  @Value("${app.host.url}")
  private String hostUrl;

  public Page<LoteConImagenDto> findAll(int page, int size, String sortBy, String sortDir) {
    Sort.Order order =
        new Sort.Order(
            sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC,
            sortBy == null ? "fchCaduc" : sortBy);
    Pageable pageable = PageRequest.of(page, size, Sort.by(order));
    Page<LoteConImagenDto> pages = ltpdRepository.findAllLotes(pageable);
    LocalDate today = LocalDate.now();
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
            dto.setImage(hostUrl + "/api/public/fotos-inventarios/" + dto.getImage());
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
