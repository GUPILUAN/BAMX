package com.bamx.backend.auth.services;

import static org.junit.Assert.assertEquals;

import com.bamx.backend.auth.dtos.Rol1005Dto;
import org.firebirdsql.testcontainers.FirebirdContainer;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

@SpringBootTest
@Testcontainers
@ActiveProfiles("test")
public class Rol1005ServiceTest {

  @Autowired private Rol1005Service rol1005Service;

  private static final DockerImageName IMAGE =
      DockerImageName.parse(FirebirdContainer.PROJECT_IMAGE);

  @Container @ServiceConnection
  static FirebirdContainer<?> firebird = new FirebirdContainer<>(IMAGE);

  @Test
  void testCreateNewRol() {
    Rol1005Dto rol = Rol1005Dto.builder().idRol(1).nombre("Test Role").tipo((short) 1).build();
    Rol1005Dto savedRol = rol1005Service.createNewRol(rol);
    assertEquals(rol.getIdRol(), savedRol.getIdRol());
  }
}
