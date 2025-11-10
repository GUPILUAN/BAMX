package com.bamx.backend.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "ALMACENES")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Almacen {

  @Id
  @Column(name = "CVE_ALM", nullable = false)
  private Integer cveAlm; // warehouse key [Table ID = 68 in TBLCONTROL]

  @Column(name = "DESCR", length = 40)
  private String descr; // Description

  @Column(name = "DIRECCION", length = 60)
  private String direccion; // Address

  @Column(name = "ENCARGADO", length = 60)
  private String encargado; // Manager

  @Column(name = "TELEFONO", length = 16)
  private String telefono; // Phone

  @Column(name = "LISTA_PREC")
  private Integer listaPrec; // Price List

  @Column(name = "CUEN_CONT", length = 28)
  private String cuenCont; // Accounting Account

  @Column(name = "CVE_MENT")
  private Integer cveMent; // Entry Movement Key

  @Column(name = "CVE_MSAL")
  private Integer cveMsal; // Exit Movement Key

  @Column(name = "STATUS", length = 1)
  private String status; // Status (A=Activo [Active] , B=Baja [Inactive])

  @Column(name = "LAT")
  private Double lat; // Latitude

  @Column(name = "LON")
  private Double lon; // Longitude

  @Column(name = "UUID", length = 50)
  private String uuid; // UUID for sync SAE Movil

  @Column(name = "VERSION_SINC")
  private LocalDateTime versionSinc; // Date and hour SAE Movil sync version

  @Lob
  @Column(name = "UBI_DEST")
  private String ubiDest;
}
