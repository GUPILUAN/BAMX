package com.bamx.backend.auth.services;

import com.bamx.backend.auth.models.Rol1005;
import com.bamx.backend.auth.repositories.Rol1005Repository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class Rol1005Service {
  private final Rol1005Repository rol1005Repository;

  public List<Rol1005> getAllRoles() {
    return rol1005Repository.findAll();
  }
}
