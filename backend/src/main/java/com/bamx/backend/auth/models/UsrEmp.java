package com.bamx.backend.auth.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "USREMP")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsrEmp {

  @Id
  @Column(name = "IDUSREMP", nullable = false)
  private Integer idUsrEmp;

  @Column(name = "IDUSR")
  private Integer idUsr;

  @Column(name = "IDSIST")
  private Integer idSist;

  @Column(name = "EMPRESA")
  private Integer empresa;

  @Column(name = "IDROL")
  private Integer idRol;

  @Column(name = "STATUS")
  private Integer status;
}
