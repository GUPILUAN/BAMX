package com.bamx.backend.repositories;

import com.bamx.backend.dtos.LoteConImagenDto;
import com.bamx.backend.models.Ltpd;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface LtpdRepository extends JpaRepository<Ltpd, Integer> {

  @Query(
"""
    SELECT new com.bamx.backend.dtos.LoteConImagenDto(
        l.cveArt,
        i.descr,
        i.linProd,
        lp.descLin,
        l.lote,
        l.cantidad,
        l.fecProdLt,
        l.fchCaduc,
        l.fchUltMov,
        l.cveAlm,
        null,
        i.cveImagen
    )
    FROM Ltpd l
    JOIN Inve i ON i.cveArt = l.cveArt
    LEFT JOIN CLin lp ON lp.cveLin = i.linProd
    WHERE l.cantidad > 0
      AND l.status = 'A'
""")
  Page<LoteConImagenDto> findAllLotes(Pageable pageable);

  // Entregables (semáforo verde+amarillo): caducan a partir del cutoff (hoy+3 a medianoche),
  // que coincide exacto con la frontera "days > 2" de LtpdService. NULL queda excluido.
  @Query(
"""
    SELECT new com.bamx.backend.dtos.LoteConImagenDto(
        l.cveArt,
        i.descr,
        i.linProd,
        lp.descLin,
        l.lote,
        l.cantidad,
        l.fecProdLt,
        l.fchCaduc,
        l.fchUltMov,
        l.cveAlm,
        null,
        i.cveImagen
    )
    FROM Ltpd l
    JOIN Inve i ON i.cveArt = l.cveArt
    LEFT JOIN CLin lp ON lp.cveLin = i.linProd
    WHERE l.cantidad > 0
      AND l.status = 'A'
      AND l.fchCaduc >= :deliverableCutoff
""")
  Page<LoteConImagenDto> findDeliverableLotes(
      @Param("deliverableCutoff") LocalDateTime deliverableCutoff, Pageable pageable);

  // No aptos (semáforo rojo): ya caducaron, caducan antes del cutoff, o no tienen caducidad capturada.
  @Query(
"""
    SELECT new com.bamx.backend.dtos.LoteConImagenDto(
        l.cveArt,
        i.descr,
        i.linProd,
        lp.descLin,
        l.lote,
        l.cantidad,
        l.fecProdLt,
        l.fchCaduc,
        l.fchUltMov,
        l.cveAlm,
        null,
        i.cveImagen
    )
    FROM Ltpd l
    JOIN Inve i ON i.cveArt = l.cveArt
    LEFT JOIN CLin lp ON lp.cveLin = i.linProd
    WHERE l.cantidad > 0
      AND l.status = 'A'
      AND (l.fchCaduc < :deliverableCutoff OR l.fchCaduc IS NULL)
""")
  Page<LoteConImagenDto> findNotDeliverableLotes(
      @Param("deliverableCutoff") LocalDateTime deliverableCutoff, Pageable pageable);

  @Query(
      """
          SELECT a.descr
          FROM Ltpd l JOIN Almacen a ON a.cveAlm = l.cveAlm
          WHERE l.cveArt = :cveArt
            AND l.status = 'A'
            AND l.cantidad > 0
            AND (
                 l.fchCaduc <= :criticalDate
                 OR l.fchCaduc IS NULL
            )
          ORDER BY l.fchCaduc ASC
      """)
  List<String> findWarehouseNameInCritical(
      @Param("cveArt") String cveArt, @Param("criticalDate") LocalDateTime criticalDate);

  @Query(
      """
          SELECT a.descr
          FROM Ltpd l JOIN Almacen a ON a.cveAlm = l.cveAlm
          WHERE l.cveArt = :cveArt
            AND l.status = 'A'
            AND l.cantidad > 0
            AND l.fchCaduc <= :warningDate
          ORDER BY l.fchCaduc ASC
      """)
  List<String> findWarehouseNameInWarning(
      @Param("cveArt") String cveArt, @Param("warningDate") LocalDateTime warningDate);

  @Query(
      """
          SELECT a.descr
          FROM Ltpd l JOIN Almacen a ON a.cveAlm = l.cveAlm
          WHERE l.cveArt = :cveArt
            AND l.status = 'A'
            AND l.cantidad > 0
            AND l.fchCaduc > :warningDate
          ORDER BY l.fchCaduc ASC
      """)
  List<String> findWarehouseNameInGood(
      @Param("cveArt") String cveArt, @Param("warningDate") LocalDateTime warningDate);
}
