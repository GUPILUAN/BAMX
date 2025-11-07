package com.bamx.backend;

import org.firebirdsql.testcontainers.FirebirdContainer;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

@SpringBootTest
@Testcontainers
@ActiveProfiles("test")
class BackendApplicationTests {

  @SuppressWarnings("deprecation")
  private static final DockerImageName IMAGE =
      DockerImageName.parse(FirebirdContainer.JACOB_ALBERTY_IMAGE);

  @Container @ServiceConnection
  static FirebirdContainer<?> firebird = new FirebirdContainer<>(IMAGE);

  @Test
  void contextLoads() {}
}
