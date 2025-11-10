package com.bamx.backend.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "MINVE")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@IdClass(MInveId.class)
public class MInve {

  @Id
  @Column(name = "CVE_ART", length = 16, nullable = false)
  private String cveArt; // Article Key

  @Id
  @Column(name = "ALMACEN", nullable = false)
  private Integer almacen; // Warehouse Key

  @Id
  @Column(name = "NUM_MOV", nullable = false)
  private Integer numMov; // Movement Number Key [Table ID = 44 in TBLCONTROL for new records]

  @Id
  @Column(name = "CVE_CPTO", nullable = false)
  private Integer cveCpto; // Concept Key

  @Column(name = "FECHA_DOCU")
  private LocalDateTime fechaDocu; // Document Date

  @Column(name = "TIPO_DOC", length = 1)
  private String tipoDoc; // Document Type Tipo  [F/R/D/c/r/d/N/M] .: F=Factura, R=Remisión,

  // D=Devolución de facturas, c = Compra, r=Recepción, d=Devolución de compras,
  // N = Ninguno (Proviene de traducción), M = Movimiento al inventario

  @Column(name = "REFER", length = 20)
  private String refer; // Reference

  @Column(name = "CLAVE_CLPV", length = 10)
  private String claveClpv; // Supplier/Customer Key

  @Column(name = "VEND", length = 5)
  private String vend; // Vendor Key

  @Column(name = "CANT")
  private Double cant; // Quantity [greater than 0 even for removals]

  @Column(name = "CANT_COST")
  private Double cantCost; // Quantity for Cost

  @Column(name = "PRECIO")
  private Double precio; // Price

  @Column(name = "COSTO")
  private Double costo; // Cost (greater than 0)

  @Column(name = "AFEC_COI", length = 1)
  private String afecCoi; // Affects COI (S=Yes, N=No)

  @Column(name = "CVE_OBS")
  private Integer cveObs; // Observation Key

  @Column(name = "REG_SERIE")
  private Integer regSerie; // Series Record Key

  @Column(name = "UNI_VENTA", length = 10)
  private String uniVenta; // Sales Unit

  @Column(name = "E_LTPD")
  private Integer eLtpd; // Enlace LTPD Key

  @Column(name = "EXIST_G")
  private Double existG; // Existence per product

  @Column(name = "EXISTENCIA")
  private Double existencia; // Existence

  @Column(name = "TIPO_PROD", length = 1)
  private String tipoProd; // Product Type [P]

  @Column(name = "FACTOR_CON")
  private Double factorCon; // Conversion Factor [greater than 0]

  @Column(name = "FECHAELAB")
  private LocalDateTime fechaElab; // Elaboration Date

  @Column(name = "CTLPOL")
  private Integer ctlPol; // Control Policy

  @Column(name = "CVE_FOLIO", length = 9)
  private String cveFolio; // Folio Key

  @Column(name = "SIGNO")
  private Integer signo; // Sign (1=Addition, -1=Subtraction)

  @Column(name = "COSTEADO", length = 1)
  private String costeado; // Costed (S=Yes, N=No)

  @Column(name = "COSTO_PROM_INI")
  private Double costoPromIni; // Initial Average Cost

  @Column(name = "COSTO_PROM_FIN")
  private Double costoPromFin; // Final Average Cost

  @Column(name = "COSTO_PROM_GRAL")
  private Double costoPromGral; // General Average Cost

  @Column(name = "DESDE_INVE", length = 1)
  private String desdeInve; // From Inventory (S=Yes, N=No)

  @Column(name = "MOV_ENLAZADO")
  private Integer movEnlazado; // Linked Movement
}
