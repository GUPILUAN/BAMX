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

  // Threshold 0.001 (no > 0) para descartar ruido de punto flotante de Aspel:
  // valores como 1.62e-12 son residuos de cientos de operaciones en MINVE.
  // El frontend usa el mismo umbral en hasStock / formatQuantity, así que
  // mantener ambos sincronizados evita que el toggle "Solo con existencia"
  // muestre filas que el frontend pinta como "Sin stock".
  @Query(
"""
SELECT i FROM Inve i
WHERE i.conLote = 'S'
  AND i.tipoEle = 'P'
  AND i.status = 'A'
  AND i.exist >= 0.001
  AND (LOWER(i.cveArt) LIKE %:search% OR LOWER(i.descr) LIKE %:search%)
""")
  Page<Inve> findAllInveWithStock(@Param("search") String search, Pageable pageable);
}
