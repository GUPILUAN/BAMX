package com.bamx.backend.repositories;

import com.bamx.backend.models.Inve;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface InveRepository extends JpaRepository<Inve, String> {
  @Query(
"""
SELECT i FROM Inve i
WHERE i.conLote = 'S'
  AND i.tipoEle = 'P'
  AND i.status = 'A'
  AND (LOWER(i.cveArt) LIKE %:search% OR LOWER(i.descr) LIKE %:search%)
""")
  Page<Inve> findAllInve(@Param("search") String search, Pageable pageable);

  // Threshold 0.01 (no > 0) para descartar ruido de punto flotante de Aspel
  // y "residuo escalado" que tampoco sirve operativamente. Aspel acumula
  // errores en INVE.EXIST conforme procesa cientos de movimientos de MINVE
  // (residuos como 1.62e-12, pero también casos peores tipo CARNE DE POLLO
  // con EXIST=0.01 piezas, que son 10g de pollo — no es stock real para un
  // banco de alimentos). El frontend usa el mismo umbral en hasStock /
  // formatQuantity para que ambas capas sean coherentes.
  @Query(
"""
SELECT i FROM Inve i
WHERE i.conLote = 'S'
  AND i.tipoEle = 'P'
  AND i.status = 'A'
  AND i.exist >= 0.01
  AND (LOWER(i.cveArt) LIKE %:search% OR LOWER(i.descr) LIKE %:search%)
""")
  Page<Inve> findAllInveWithStock(@Param("search") String search, Pageable pageable);
}
