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
@Table(name = "CLIN")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CLin {
  @Id
  @Column(name = "CVE_LIN", length = 5, nullable = false)
  private String cveLin; // Line Key

  @Column(name = "DESC_LIN", length = 20)
  private String descLin; // Line Description

  @Column(name = "ESUNGPO", length = 1)
  private String esUnGpo; // Is a Group (S=Si [Yes], N=No)

  @Column(name = "CUENTA_COI", length = 28)
  private String cuentaCoi; // Accounting Account

  @Column(name = "STATUS", length = 1)
  private String status; // Status (A=Activo [Active] , B=Baja [Inactive])
}
