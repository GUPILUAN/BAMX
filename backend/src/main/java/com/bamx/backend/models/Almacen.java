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
  private Integer cveAlm;

  @Column(name = "DESCR", length = 40)
  private String descr;

  @Column(name = "DIRECCION", length = 60)
  private String direccion;

  @Column(name = "ENCARGADO", length = 60)
  private String encargado;

  @Column(name = "TELEFONO", length = 16)
  private String telefono;

  @Column(name = "LISTA_PREC")
  private Integer listaPrec;

  @Column(name = "CUEN_CONT", length = 28)
  private String cuenCont;

  @Column(name = "CVE_MENT")
  private Integer cveMent;

  @Column(name = "CVE_MSAL")
  private Integer cveMsal;

  @Column(name = "STATUS", length = 1)
  private String status;

  @Column(name = "LAT")
  private Double lat;

  @Column(name = "LON")
  private Double lon;

  @Column(name = "UUID", length = 50)
  private String uuid;

  @Column(name = "VERSION_SINC")
  private LocalDateTime versionSinc;

  @Lob
  @Column(name = "UBI_DEST")
  private String ubiDest;
}
