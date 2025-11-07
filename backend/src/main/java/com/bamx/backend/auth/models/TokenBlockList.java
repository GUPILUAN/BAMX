package com.bamx.backend.auth.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "TOKEN_BLOCK_LIST")
public class TokenBlockList {
  @Id
  @GeneratedValue(strategy = GenerationType.TABLE)
  @Column(name = "ID", nullable = false, unique = true)
  private Integer id;

  @Column(name = "JTI", nullable = false, unique = true)
  private String jti;

  @Column(name = "IDUSR", nullable = false)
  private Integer idUsr;

  @Column(name = "TOKEN_TYPE", nullable = false)
  private String tokenType;

  @Column(name = "REVOKED_AT", nullable = false)
  private LocalDateTime revokedAt;

  @Column(name = "EXPIRES_AT", nullable = false)
  private LocalDateTime expiresAt;
}
