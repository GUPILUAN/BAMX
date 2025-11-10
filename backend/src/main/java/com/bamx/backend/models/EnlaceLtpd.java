package com.bamx.backend.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ENLACE_LTPD")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@IdClass(EnlaceLtpdId.class)
public class EnlaceLtpd {

  @Id
  @Column(name = "E_LTPD", nullable = false)
  private Integer e_Ltpd; // Enlace LTPD Key

  @Id
  @Column(name = "REG_LTPD")
  private Integer regLtpd; // Registro LTPD Key

  @Column(name = "CANTIDAD")
  private Double cantidad; // Quantity (greater than 0.0)

  @Column(name = "PXRS")
  private Double pxrs; // Pending to receive/supply {0.0 ..}
}
