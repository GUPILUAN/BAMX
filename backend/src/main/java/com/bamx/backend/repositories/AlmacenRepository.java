package com.bamx.backend.repositories;

import com.bamx.backend.models.Almacen;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AlmacenRepository extends JpaRepository<Almacen, Integer> {

  @Query(
"""
    SELECT
        l.cveAlm AS almacen,
        i.linProd AS linea,
        SUM(CASE WHEN l.fchCaduc <= :criticalDate OR l.fchCaduc IS NULL THEN l.cantidad ELSE 0 END) AS criticalCount,
        SUM(CASE WHEN l.fchCaduc > :criticalDate AND l.fchCaduc <= :warningDate THEN l.cantidad ELSE 0 END) AS warningCount,
        SUM(CASE WHEN l.fchCaduc > :warningDate THEN l.cantidad ELSE 0 END) AS goodCount,
        MAX(l.fchUltMov) AS lastUpdate
    FROM Ltpd l
    JOIN Inve i ON i.cveArt = l.cveArt
    WHERE l.cantidad > 0 AND l.status = 'A'
    GROUP BY l.cveAlm, i.linProd
    ORDER BY l.cveAlm, i.linProd
""")
  List<Object[]> getDashboardData(
      @Param("criticalDate") LocalDateTime criticalDate,
      @Param("warningDate") LocalDateTime warningDate);
}
