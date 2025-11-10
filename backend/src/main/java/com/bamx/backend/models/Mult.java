package com.bamx.backend.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "MULT")
@IdClass(MultId.class)
public class Mult {

  @Id
  @Column(name = "CVE_ART", length = 16, nullable = false)
  private String cveArt; // Article Key

  @Id
  @Column(name = "CVE_ALM", nullable = false)
  private Integer cveAlm; // Warehouse Key

  @Column(name = "STATUS", length = 1)
  private String status; // Status (A=Active, B=Inactive)

  @Column(name = "CTRL_ALM", length = 10)
  private String ctrlAlm; // Warehouse Control

  @Column(name = "EXIST")
  private Double exist; // Existence

  @Column(name = "STOCK_MIN")
  private Double stockMin; // Minimum Stock

  @Column(name = "STOCK_MAX")
  private Double stockMax; // Maximum Stock

  @Column(name = "COMP_X_REC")
  private Double compXRec; // Purchases to receive

  @Column(name = "UUID", length = 50)
  private String uuid; // UUID for SAE Movil sync

  @Column(name = "VERSION_SINC")
  private LocalDateTime versionSinc; // Date and hour SAE Movil sync version
}
