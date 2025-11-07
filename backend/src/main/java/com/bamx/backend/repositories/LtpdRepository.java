package com.bamx.backend.repositories;

import com.bamx.backend.models.Ltpd;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LtpdRepository extends JpaRepository<Ltpd, String> {}
