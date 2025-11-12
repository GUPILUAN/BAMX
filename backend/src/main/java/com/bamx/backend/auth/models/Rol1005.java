package com.bamx.backend.auth.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ROL001005")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Rol1005 {
  @Id
  @Column(name = "IDROL")
  private Integer idRol;

  @Column(name = "NOMBRE", length = 30)
  private String nombre;

  @Column(name = "TIPO", nullable = false)
  private Short tipo;
}
