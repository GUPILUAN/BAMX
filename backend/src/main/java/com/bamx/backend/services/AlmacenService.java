package com.bamx.backend.services;

import com.bamx.backend.config.BamxConfig;
import com.bamx.backend.dtos.AlmacenDashboardDto;
import com.bamx.backend.dtos.AlmacenDto;
import com.bamx.backend.mappers.AlmacenMapper;
import com.bamx.backend.models.Almacen;
import com.bamx.backend.repositories.AlmacenRepository;
import com.bamx.backend.repositories.CLinRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AlmacenService {

  private final AlmacenRepository almacenRepository;
  private final AlmacenMapper almacenMapper;
  private final CLinRepository cLinRepository;
  private final BamxConfig bamxConfig;

  public List<AlmacenDto> getAllAlmacenes() {
    return almacenMapper.toDtoList(almacenRepository.findAll());
  }

  public List<AlmacenDashboardDto> getDashboard() {

    List<Object[]> rows = almacenRepository.getDashboardData();

    // group by almacen ID
    Map<Integer, List<Object[]>> porAlmacen =
        rows.stream().collect(Collectors.groupingBy(r -> ((Number) r[0]).intValue()));

    List<AlmacenDashboardDto> resultado = new ArrayList<>();

    for (var entry : porAlmacen.entrySet()) {

      Integer almacenId = entry.getKey();
      List<Object[]> lineas = entry.getValue();

      Almacen alm = almacenRepository.findById(almacenId).orElse(null);
      String nombre = alm != null ? alm.getDescr() : ("Almacén " + almacenId);

      // Labels

      // 1. Extraer todas las líneas
      List<String> codigosLineas =
          lineas.stream().map(r -> (String) r[1]).distinct().sorted().toList();

      // 2. Convertir cada línea a nombre
      List<String> labels =
          codigosLineas.stream()
              .map(codLin -> cLinRepository.findDescLinByCveLin(codLin))
              .toList()
              .stream()
              .map(cl -> cl.substring(0, 1).toUpperCase() + cl.substring(1).toLowerCase())
              .toList();

      // Data
      List<List<Long>> data = new ArrayList<>();

      for (String linea : codigosLineas) {

        Object[] fila = lineas.stream().filter(r -> linea.equals(r[1])).findFirst().orElse(null);

        if (fila != null) {
          Long critical = ((Number) fila[2]).longValue();
          Long warning = ((Number) fila[3]).longValue();
          Long good = ((Number) fila[4]).longValue();

          data.add(List.of(critical, warning, good));
        } else {

          data.add(List.of(0L, 0L, 0L));
        }
      }

      LocalDateTime lastUpdate =
          lineas.stream()
              .map(
                  r -> {
                    Object v = r[5];
                    return (v instanceof java.sql.Timestamp)
                        ? ((java.sql.Timestamp) v).toLocalDateTime()
                        : null;
                  })
              .filter(Objects::nonNull)
              .max(LocalDateTime::compareTo)
              .orElse(null);

      resultado.add(
          AlmacenDashboardDto.builder()
              .id(almacenId)
              .name(
                  nombre
                      + (bamxConfig.getRefrigeradores().contains(almacenId)
                          ? " (Refrigerador)"
                          : ""))
              .active(alm != null && alm.getStatus().equalsIgnoreCase("A"))
              .last_update(lastUpdate != null ? lastUpdate.toString() : null)
              .labels(labels)
              .data(data)
              .temperature(0)
              .build());
    }

    return resultado;
  }
}
