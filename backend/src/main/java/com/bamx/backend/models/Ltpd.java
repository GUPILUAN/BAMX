package com.bamx.backend.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "LTPD")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Ltpd {

  @Id
  @Column(name = "REG_LTPD", nullable = false)
  private Integer regLtpd; // Registro LTPD Key, [Table ID = 48 in TBLCONTROL for new records]

  @Column(name = "CVE_ART", length = 16, nullable = false)
  private String cveArt; // Article Key

  @Column(name = "LOTE", length = 12)
  private String lote; // Lot

  @Column(name = "PEDIMENTO", length = 21)
  private String pedimento; // Customs Declaration

  @Column(name = "CVE_ALM")
  private Integer cveAlm; // Warehouse Key

  @Column(name = "FCHCADUC")
  private LocalDateTime fchCaduc; // Expiration Date

  @Column(name = "FCHADUANA")
  private LocalDateTime fchAduana; // Customs Date

  @Column(name = "FCHULTMOV")
  private LocalDateTime fchUltMov; // Last Movement Date

  @Column(name = "NOM_ADUAN", length = 40)
  private String nomAduan; // Customs Name

  @Column(name = "CANTIDAD")
  private Double cantidad; // Quantity

  @Column(name = "CVE_OBS")
  private Integer cveObs; // Observation Key

  @Column(name = "CIUDAD", length = 60)
  private String ciudad; // City

  @Column(name = "FRONTERA", length = 60)
  private String frontera; // Border

  @Column(name = "FEC_PROD_LT")
  private LocalDateTime fecProdLt; // Production Date LT

  @Column(name = "GLN", length = 13)
  private String gln; // Global Location Number

  @Column(name = "STATUS", length = 1)
  private String status; // Status (A=Active, B=Inactive)

  @Column(name = "PEDIMENTOSAT", length = 21)
  private String pedimentoSat; // Customs Declaration SAT
}
