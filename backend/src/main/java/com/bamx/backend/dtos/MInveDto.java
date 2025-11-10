package com.bamx.backend.dtos;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MInveDto {
  private String cveArt;
  private Integer almacen;
  private Integer numMov;
  private Integer cveCpto;
  private LocalDateTime fechaDocu;
  private String tipoDoc;
  private String refer;
  private String claveClpv;
  private String vend;
  private Double cant;
  private Double cantCost;
  private Double precio;
  private Double costo;
  private String afecCoi;
  private Integer cveObs;
  private Integer regSerie;
  private String uniVenta;
  private Integer e_Ltpd;
  private Double existG;
  private Double existencia;
  private String tipoProd;
  private Double factorCon;
  private LocalDateTime fechaElab;
  private Integer ctlPol;
  private String cveFolio;
  private Integer signo;
  private String costeado;
  private Double costoPromIni;
  private Double costoPromFin;
  private Double costoPromGral;
  private String desdeInve;
  private Integer movEnlazado;
}
