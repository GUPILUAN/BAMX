package com.bamx.backend.auth.repositories;

import com.bamx.backend.auth.models.FotoUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FotoUsuarioRepository extends JpaRepository<FotoUsuario, Integer> {}
