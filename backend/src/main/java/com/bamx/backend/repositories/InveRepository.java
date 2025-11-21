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
}
