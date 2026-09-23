package com.bamx.backend.repositories;

import com.bamx.backend.models.Mult;
import com.bamx.backend.models.MultId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MultRepository extends JpaRepository<Mult, MultId> {

  // Existencia por almacén de un producto. MULT es el catálogo multi-almacén de
  // Aspel (CVE_ART + CVE_ALM -> EXIST); INVE.EXIST es su suma.
  //
  // Umbral 0.01, el mismo de InveRepository.findAllInveWithStock: MULT arrastra
  // el mismo ruido de punto flotante que INVE.EXIST (39 de las 46 filas con
  // EXIST > 0 en BAMX son residuos tipo 1.8e-11), y sin él el detalle listaría
  // almacenes fantasma con cantidades ilegibles.
  //
  // LEFT JOIN para no perder la fila si el CVE_ALM no estuviera en ALMACENES.
  @Query(
"""
    SELECT m.cveAlm, a.descr, m.exist
    FROM Mult m
    LEFT JOIN Almacen a ON a.cveAlm = m.cveAlm
    WHERE m.cveArt = :cveArt
      AND m.status = 'A'
      AND m.exist >= 0.01
    ORDER BY m.exist DESC
""")
  List<Object[]> findStockByProduct(@Param("cveArt") String cveArt);
}
