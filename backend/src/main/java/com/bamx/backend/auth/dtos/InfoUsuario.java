package com.bamx.backend.auth.dtos;

import lombok.*;

@Data
@Builder
public class InfoUsuario {
  private Integer idUsr;
  private String nombre;
  private String usuario;
  private String mail;
  private byte[] fotografia;
  private String rol;
  private Integer empresa;
  private String puesto;
  private String depto;
}
