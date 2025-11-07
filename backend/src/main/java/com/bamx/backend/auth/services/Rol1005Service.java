package com.bamx.backend.auth.services;

import com.bamx.backend.auth.dtos.Rol1005Dto;
import com.bamx.backend.auth.mappers.Rol1005Mapper;
import com.bamx.backend.auth.models.Rol1005;
import com.bamx.backend.auth.repositories.Rol1005Repository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class Rol1005Service {
  private final Rol1005Repository rol1005Repository;
  private final Rol1005Mapper rol1005Mapper;

  public List<Rol1005> getAllRoles() {
    return rol1005Repository.findAll();
  }

  public Rol1005Dto createNewRol(Rol1005Dto rol1005) {
    Rol1005 rol1005Entity = rol1005Mapper.toEntity(rol1005);
    if (rol1005Entity.getTipo() == null) {
      rol1005Entity.setTipo((short) 1);
    }
    return rol1005Mapper.toDto(rol1005Repository.save(rol1005Entity));
  }
}
