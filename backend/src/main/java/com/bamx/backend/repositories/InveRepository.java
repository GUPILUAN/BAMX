package com.bamx.backend.repositories;

import com.bamx.backend.models.Inve;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InveRepository extends JpaRepository<Inve, String> {}
