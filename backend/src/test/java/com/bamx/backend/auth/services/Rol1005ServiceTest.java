package com.bamx.backend.auth.services;

import static org.junit.Assert.assertEquals;

import com.bamx.backend.auth.dtos.Rol1005Dto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
public class Rol1005ServiceTest {

  @Autowired private Rol1005Service rol1005Service;

  @Test
  void testCreateNewRol() {
    Rol1005Dto rol = Rol1005Dto.builder().idRol(1).nombre("Test Role").tipo((short) 1).build();
    Rol1005Dto savedRol = rol1005Service.createNewRol(rol);
    assertEquals(rol.getIdRol(), savedRol.getIdRol());
  }
}
