package com.bamx.backend.models;

import jakarta.persistence.*;
import lombok.*;

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
  private Integer eLtpd; // Enlace LTPD Key

  @Id
  @Column(name = "REG_LTPD")
  private Integer regLtpd; // Registro LTPD Key

  @Column(name = "CANTIDAD")
  private Double cantidad; // Quantity (greater than 0.0)

  @Column(name = "PXRS")
  private Double pxrs; // Pending to receive/supply {0.0 ..}
}
