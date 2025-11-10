package com.bamx.backend.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "NUMSER")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@IdClass(NumSerId.class)
public class NumSer {

  @Id
  @Column(name = "CVE_ART", length = 16, nullable = false)
  private String cveArt; // Article Key

  @Id
  @Column(name = "NUM_SER", length = 25, nullable = false)
  private String numSer; // Serial Number

  @Id
  @Column(name = "ALMACEN", nullable = false)
  private Integer almacen; // Warehouse Key

  @Column(name = "STATUS", length = 1)
  private String status; // Status [V/D/N/F/B] .: V= Vendido [Sold], D=Disponible [Available],

  // N= No disponible [Not Available], F= Defectuoso [Defective], B= Baja [Inactive]

  @Column(name = "COSTO")
  private Double costo; // Cost

  @Column(name = "DOCTO_ENT", length = 20)
  private String doctoEnt; // Entry Document

  @Column(name = "FECHA_ENT")
  private LocalDateTime fechaEnt; // Entry Date
}
