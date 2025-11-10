package com.bamx.backend.config;

import java.util.List;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "bamx")
@Data
public class BamxConfig {
  private List<Integer> refrigeradores;
}
