package com.bamx.backend.auth.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "USUARIOS")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {

  @Id
  @Column(name = "IDUSR", nullable = false)
  private Integer idUsr;

  @Column(name = "NOMBRE", length = 80)
  private String nombre;

  @Column(name = "USUARIO", length = 15)
  private String usuario;

  @Column(name = "PASS", length = 20)
  private String pass;

  @Column(name = "ESTADO")
  private Integer estado;

  @Column(name = "PUESTO", length = 30)
  private String puesto;

  @Column(name = "DEPTO", length = 30)
  private String depto;

  @Column(name = "MAIL", length = 80)
  private String mail;
}
