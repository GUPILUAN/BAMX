package com.bamx.backend.repositories;

import com.bamx.backend.models.Almacen;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface AlmacenRepository extends JpaRepository<Almacen, Integer> {

  @Query(
      value =
          """
              SELECT
                  l.CVE_ALM AS almacen,
                  i.LIN_PROD AS linea,
                  -- CRITICAL (<=2 días)
                  SUM(
                      CASE
                          WHEN l.FCHCADUC <= DATEADD(DAY, 2, CURRENT_DATE) OR l.FCHCADUC IS NULL
                          THEN l.CANTIDAD ELSE 0
                      END
                  ) AS criticalCount,

                  -- WARNING (3 a 5 días)
                  SUM(
                      CASE
                          WHEN l.FCHCADUC > DATEADD(DAY, 2, CURRENT_DATE)
                           AND l.FCHCADUC <= DATEADD(DAY, 5, CURRENT_DATE)
                          THEN l.CANTIDAD ELSE 0
                      END
                  ) AS warningCount,

                  -- GOOD (>5 días)
                  SUM(
                      CASE
                          WHEN l.FCHCADUC > DATEADD(DAY, 5, CURRENT_DATE)
                          THEN l.CANTIDAD ELSE 0
                      END
                  ) AS goodCount,

                  -- Último movimiento del almacén
                  MAX(l.FCHULTMOV) AS lastUpdate

              FROM LTPD01 l
              JOIN INVE01 i ON i.CVE_ART = l.CVE_ART
              WHERE l.CANTIDAD > 0
                AND l.STATUS = 'A'
              GROUP BY l.CVE_ALM, i.LIN_PROD
              ORDER BY l.CVE_ALM, i.LIN_PROD
          """,
      nativeQuery = true)
  List<Object[]> getDashboardData();
}
