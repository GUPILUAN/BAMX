package com.bamx.backend.repositories;

import com.bamx.backend.models.CLin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface CLinRepository extends JpaRepository<CLin, String> {

  @Query(
      value =
          """
          SELECT c.descLin
          FROM CLin c
          WHERE c.cveLin = :cveLin
          """)
  String findDescLinByCveLin(String cveLin);
}
