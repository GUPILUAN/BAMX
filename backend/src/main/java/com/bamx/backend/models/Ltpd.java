package com.bamx.backend.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "LTPD")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Ltpd {

  @Id
  @Column(name = "REG_LTPD", nullable = false)
  private Integer regLtpd;

  @Column(name = "CVE_ART", length = 16, nullable = false)
  private String cveArt;

  @Column(name = "LOTE", length = 12)
  private String lote;

  @Column(name = "PEDIMENTO", length = 21)
  private String pedimento;

  @Column(name = "CVE_ALM")
  private Integer cveAlm;

  @Column(name = "FCHCADUC")
  private LocalDateTime fchCaduc;

  @Column(name = "FCHADUANA")
  private LocalDateTime fchAduana;

  @Column(name = "FCHULTMOV")
  private LocalDateTime fchUltMov;

  @Column(name = "NOM_ADUAN", length = 40)
  private String nomAduan;

  @Column(name = "CANTIDAD")
  private Double cantidad;

  @Column(name = "CVE_OBS")
  private Integer cveObs;

  @Column(name = "CIUDAD", length = 60)
  private String ciudad;

  @Column(name = "FRONTERA", length = 60)
  private String frontera;

  @Column(name = "FEC_PROD_LT")
  private LocalDateTime fecProdLt;

  @Column(name = "GLN", length = 13)
  private String gln;

  @Column(name = "STATUS", length = 1)
  private String status;

  @Column(name = "PEDIMENTOSAT", length = 21)
  private String pedimentoSat;
}
