package com.bamx.backend.auth.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "FOTOUSUARIO")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FotoUsuario {

  @Id
  @Column(name = "IDUSR", nullable = false)
  private Integer idUsr;

  @Lob
  @Column(name = "FOTOGRAFIA")
  private byte[] fotografia;
}
