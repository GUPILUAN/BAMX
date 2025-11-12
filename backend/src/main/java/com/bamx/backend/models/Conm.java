package com.bamx.backend.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "CONM")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Conm {

  @Id
  @Column(name = "CVE_CPTO", nullable = false)
  private Integer cveCpto; // Concept Key

  @Column(name = "DESCR", length = 18)
  private String descr; // Concept Description

  @Column(name = "CPN", length = 1)
  private String cpn; // Associated to [C/P/N] .: C = Cliente, P = Proveedor, N = Ninguno

  @Column(name = "CUEN_CONT", length = 28)
  private String cuenCont; // Accounting Account

  @Column(name = "TIPO_MOV", length = 1)
  private String tipoMov; // Movement Type (E=Entry, S=Exit)

  @Column(name = "STATUS", length = 1)
  private String status; // Status (A=Active, B=Inactive)

  @Column(name = "SIGNO")
  private Short signo; // Sign (1=Positive, -1=Negative)
}
