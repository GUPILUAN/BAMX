package com.bamx.backend.services;

import com.bamx.backend.dtos.InventoryItem;
import com.bamx.backend.dtos.ProductLocationDto;
import com.bamx.backend.dtos.ProductWarehouseDto;
import com.bamx.backend.mappers.InveMapper;
import com.bamx.backend.models.Inve;
import com.bamx.backend.repositories.CLinRepository;
import com.bamx.backend.repositories.InveRepository;
import com.bamx.backend.repositories.LtpdRepository;
import com.bamx.backend.repositories.MultRepository;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
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
  private final MultRepository multRepository;
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

  /**
   * En qué almacenes está un producto. Combina las dos fuentes de Aspel en vez
   * de elegir una: MULT da la existencia por bodega (funciona sin lotes) y LTPD
   * da lote y caducidad (funciona aunque MULT esté en cero). En BAMX ninguna
   * cubre sola el catálogo, así que se unen por CVE_ALM.
   *
   * <p>Devuelve null si el producto no existe, para que el controller responda 404.
   */
  public ProductLocationDto getProductLocations(String cveArt) {
    Inve producto = inveRepository.findById(cveArt).orElse(null);
    if (producto == null) {
      return null;
    }

    Map<Integer, ProductWarehouseDto> porAlmacen = new LinkedHashMap<>();

    for (Object[] row : multRepository.findStockByProduct(cveArt)) {
      Integer cveAlm = toInt(row[0]);
      porAlmacen.put(
          cveAlm,
          ProductWarehouseDto.builder()
              .warehouse_id(cveAlm)
              .warehouse_name(nombreAlmacen((String) row[1], cveAlm))
              .stock_quantity(toDouble(row[2]))
              .lots_quantity(0d)
              .lots_count(0)
              .lots_without_expiration(0)
              .build());
    }

    for (Object[] row : ltpdRepository.findLotSummaryByProduct(cveArt)) {
      Integer cveAlm = toInt(row[0]);
      int lotes = toInt(row[3]);
      int conCaducidad = toInt(row[4]);

      ProductWarehouseDto almacen =
          porAlmacen.computeIfAbsent(
              cveAlm,
              k ->
                  ProductWarehouseDto.builder()
                      .warehouse_id(k)
                      .warehouse_name(nombreAlmacen((String) row[1], k))
                      .stock_quantity(0d)
                      .build());

      almacen.setLots_quantity(toDouble(row[2]));
      almacen.setLots_count(lotes);
      almacen.setLots_without_expiration(lotes - conCaducidad);
      almacen.setNearest_expiration((LocalDateTime) row[5]);
    }

    List<ProductWarehouseDto> almacenes =
        porAlmacen.values().stream()
            .sorted(Comparator.comparingDouble(InveService::cantidadVisible).reversed())
            .toList();

    return ProductLocationDto.builder()
        .product_id(producto.getCveArt())
        .product_name(producto.getDescr())
        .unit(producto.getUniMed() == null ? null : producto.getUniMed().toLowerCase())
        .total_quantity(producto.getExist())
        .warehouses(almacenes)
        .build();
  }

  // Los lotes mandan cuando existen: es la cifra que ya usan el Semáforo y las
  // pantallas de entregables. MULT.EXIST cubre el resto del catálogo.
  private static double cantidadVisible(ProductWarehouseDto almacen) {
    double lotes = almacen.getLots_quantity() == null ? 0d : almacen.getLots_quantity();
    return lotes > 0
        ? lotes
        : (almacen.getStock_quantity() == null ? 0d : almacen.getStock_quantity());
  }

  // ALMACENES.DESCR en BAMX trae los nombres por defecto de Aspel ("Almacén 3").
  // El fallback sólo aplica si el almacén no está dado de alta, y replica el que
  // ya usa AlmacenService.getDashboard para no mostrar dos formatos distintos.
  private static String nombreAlmacen(String descr, Integer cveAlm) {
    return descr != null && !descr.isBlank() ? descr.trim() : "Almacén " + cveAlm;
  }

  private static int toInt(Object value) {
    return value == null ? 0 : ((Number) value).intValue();
  }

  private static double toDouble(Object value) {
    return value == null ? 0d : ((Number) value).doubleValue();
  }
}
