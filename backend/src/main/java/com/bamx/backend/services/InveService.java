package com.bamx.backend.services;

import com.bamx.backend.dtos.InventoryItem;
import com.bamx.backend.mappers.InveMapper;
import com.bamx.backend.models.Inve;
import com.bamx.backend.repositories.CLinRepository;
import com.bamx.backend.repositories.InveRepository;
import com.bamx.backend.repositories.LtpdRepository;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InveService {
  private final InveRepository inveRepository;
  private final LtpdRepository ltpdRepository;
  private final CLinRepository cLinRepository;
  private final InveMapper inveMapper;

  public Page<InventoryItem> getAllInve(
      int page,
      int size,
      String sortBy,
      String sortDir,
      String search,
      boolean onlyWithStock) {
    Sort.Order userOrder =
        new Sort.Order(
            sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC,
            sortBy == null ? "fchCaduc" : sortBy);
    // Cuando se piden todos (con y sin stock), priorizar los que tienen stock
    // anteponiendo exist DESC como primer criterio. Cuando onlyWithStock=true
    // este sort es redundante pero no hace daño.
    Sort sort = Sort.by(Sort.Order.desc("exist")).and(Sort.by(userOrder));
    Pageable pageable = PageRequest.of(page, size, sort);
    LocalDateTime now = LocalDateTime.now();
    LocalDateTime warningDate = now.plusDays(2);
    LocalDateTime criticalDate = now.plusDays(5);

    String normalizedSearch = search == null ? "" : search.toLowerCase().trim();
    Page<Inve> rawPage =
        onlyWithStock
            ? inveRepository.findAllInveWithStock(normalizedSearch, pageable)
            : inveRepository.findAllInve(normalizedSearch, pageable);

    Page<InventoryItem> pages =
        rawPage
            .map(inveMapper::toDto)
            .map(
                i ->
                    InventoryItem.builder()
                        .id(i.getCveArt())
                        .name(i.getDescr())
                        .type(
                            i.getLinProd() != null
                                ? cLinRepository.findDescLinByCveLin(i.getLinProd())
                                : null)
                        .available_quantity(i.getExist())
                        .unit(i.getUniMed().toLowerCase())
                        .warehouseNamesCritical(
                            ltpdRepository.findWarehouseNameInCritical(i.getCveArt(), criticalDate))
                        .warehouseNamesWarning(
                            ltpdRepository.findWarehouseNameInWarning(i.getCveArt(), warningDate))
                        .warehouseNamesGood(
                            ltpdRepository.findWarehouseNameInGood(i.getCveArt(), warningDate))
                        .build());
    return pages;
  }
}
