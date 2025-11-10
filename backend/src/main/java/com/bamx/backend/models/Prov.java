package com.bamx.backend.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "PROV")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Prov {

  @Id
  @Column(name = "CLAVE", length = 10, nullable = false)
  private String clave; // Provider Key [Table ID = 12 in TBLCONTROL for new records]

  @Column(name = "STATUS", length = 1)
  private String status; // Status (A=Active, B=Inactive, S=Suspended)

  @Column(name = "NOMBRE", length = 254)
  private String nombre; // Name

  @Column(name = "RFC", length = 15)
  private String rfc; // Federal Taxpayer Registry

  @Column(name = "CALLE", length = 80)
  private String calle; // Street

  @Column(name = "NUMINT", length = 15)
  private String numInt; // Interior Number

  @Column(name = "NUMEXT", length = 15)
  private String numExt; // Exterior Number

  @Column(name = "CRUZAMIENTOS", length = 40)
  private String cruzaMientos; // Cross Streets

  @Column(name = "CRUZAMIENTOS2", length = 40)
  private String cruzaMientos2; // Cross Streets 2

  @Column(name = "COLONIA", length = 50)
  private String colonia; // Neighborhood

  @Column(name = "CODIGO", length = 5)
  private String codigo; // Postal Code

  @Column(name = "LOCALIDAD", length = 50)
  private String localidad; // Locality

  @Column(name = "MUNICIPIO", length = 50)
  private String municipio; // Municipality

  @Column(name = "ESTADO", length = 50)
  private String estado; // State

  @Column(name = "CVE_PAIS", length = 2)
  private String cvePais; // Country Key e.g., MX

  @Column(name = "NACIONALIDAD", length = 40)
  private String nacionalidad; // Nationality

  @Column(name = "TELEFONO", length = 25)
  private String telefono; // Phone number

  @Column(name = "CLASIFIC", length = 5)
  private String clasificacion; // Classification

  @Column(name = "FAX", length = 25)
  private String fax; // Fax number

  @Column(name = "PAG_WEB", length = 60)
  private String pagWeb; // Web Page

  @Column(name = "CURP", length = 18)
  private String curp; // Unique Population Registry Code

  @Column(name = "CVE_ZONA", length = 6)
  private String cveZona; // Zone Key

  @Column(name = "CON_CREDITO", length = 1)
  private String conCredito; // With Credit (S=Yes, N=No)

  @Column(name = "DIASCRED")
  private Integer diasCred; // Credit Days

  @Column(name = "LIMCRED")
  private Double limCred; // Credit Limit

  @Column(name = "CVE_BITA")
  private Integer cveBita; // Audit Key

  @Column(name = "ULT_PAGOD", length = 20)
  private String ultPagoD; // Last Payment Document

  @Column(name = "ULT_PAGOM")
  private Double ultPagoM; // Last Payment Amount

  @Column(name = "ULT_PAGOF")
  private LocalDateTime ultPagoF; // Last Payment Date

  @Column(name = "ULT_COMPD", length = 20)
  private String ultCompD; // Last Purchase Document

  @Column(name = "ULT_COMPM")
  private Double ultCompM; // Last Purchase Amount

  @Column(name = "ULT_COMPF")
  private LocalDateTime ultCompF; // Last Purchase Date

  @Column(name = "SALDO")
  private Double saldo; // Balance

  @Column(name = "VENTAS")
  private Double ventas; // Sales

  @Column(name = "DESCUENTO")
  private Double descuento; // Discount

  @Column(name = "TIP_TERCERO")
  private Integer tipTercero; // Third Party Type

  @Column(name = "TIP_OPERA")
  private Integer tipOpera; // Operation Type

  @Column(name = "CVE_OBS")
  private Integer cveObs; // Observation Key

  @Column(name = "CUENTA_CONTABLE", length = 28)
  private String cuentaContable; // Accounting Account

  @Column(name = "FORMA_PAGO")
  private Integer formaPago; // Payment Method

  @Column(name = "BENEFICIARIO", length = 60)
  private String beneficiario; // Beneficiary

  @Column(name = "TITULAR_CUENTA", length = 60)
  private String titularCuenta; // Account Holder

  @Column(name = "BANCO", length = 3)
  private String banco; // Bank

  @Column(name = "SUCURSAL_BANCO", length = 4)
  private String sucursalBanco; // Bank Branch

  @Column(name = "CUENTA_BANCO", length = 16)
  private String cuentaBanco; // Bank Account

  @Column(name = "CLABE", length = 18)
  private String clabe; // CLABE

  @Column(name = "DESC_OTROS", length = 60)
  private String descOtros; // Other Description

  @Column(name = "IMPRIR", length = 1)
  private String imprir; // Print (S=Yes, N=No)

  @Column(name = "MAIL", length = 1)
  private String mail; // Send by Email (S=Yes, N=No)

  @Column(name = "NIVELSEC")
  private Integer nivelSec; // Security Level

  @Column(name = "ENVIOSILEN", length = 1)
  private String envioSilen; // Silent Send (S=Yes, N=No)

  @Column(name = "EMAILPRED", length = 60)
  private String emailPred; // Default Email

  @Column(name = "MODELO", length = 255)
  private String modelo; // Model

  @Column(name = "LAT")
  private Double lat; // Latitude

  @Column(name = "LON")
  private Double lon; // Longitude

  @Column(name = "VAL_RFC")
  private Integer valRfc; // RFC Validation

  @Column(name = "REG_FISC", length = 4)
  private String regFisc; // Fiscal Regime
}
