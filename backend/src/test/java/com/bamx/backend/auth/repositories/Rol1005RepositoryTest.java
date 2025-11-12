package com.bamx.backend.auth.repositories;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import com.bamx.backend.auth.models.Rol1005;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@AutoConfigureTestDatabase
@ActiveProfiles("test")
public class Rol1005RepositoryTest {

  @Autowired private Rol1005Repository rol1005Repository;

  @Test
  void testSaveAndFind() {

    Integer idRol = 1;
    Rol1005 rol = Rol1005.builder().idRol(idRol).nombre("Admin").tipo((short) 1).build();

    assertNotNull(rol);
    rol1005Repository.save(rol);

    Rol1005 foundRol = rol1005Repository.findById(idRol).orElse(null);

    assertNotNull(foundRol);
    assertEquals(idRol, foundRol.getIdRol());
  }
}
