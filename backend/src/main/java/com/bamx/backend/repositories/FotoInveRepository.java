package com.bamx.backend.repositories;

import com.bamx.backend.models.FotoInve;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FotoInveRepository extends JpaRepository<FotoInve, String> {}
