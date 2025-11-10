package com.bamx.backend.repositories;

import com.bamx.backend.dtos.LoteConImagenDto;
import com.bamx.backend.models.Ltpd;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface LtpdRepository extends JpaRepository<Ltpd, String> {

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
}
