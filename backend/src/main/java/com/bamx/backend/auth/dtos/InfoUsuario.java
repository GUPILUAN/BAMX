package com.bamx.backend.auth.dtos;

import lombok.*;

@Data
@Builder
public class InfoUsuario {
  private Integer id;
  private String name;
  private String username;
  private String email;
  private String role;
  private Integer company;
  private String position;
  private String department;
  private Integer status;
  private String profile_picture;
}
