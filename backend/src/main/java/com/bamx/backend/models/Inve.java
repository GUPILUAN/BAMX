package com.bamx.backend.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "INVE")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Inve {

  @Id
  @Column(name = "CVE_ART", length = 16, nullable = false)
  private String cveArt; // Article Key

  @Column(name = "DESCR", length = 40)
  private String descr; // Description

  @Column(name = "LIN_PROD", length = 5)
  private String linProd; // Product Line Key

  @Column(name = "CON_SERIE", length = 1)
  private String conSerie; // With Series (S=Si[Yes], N=No)

  @Column(name = "UNI_MED", length = 10)
  private String uniMed; // Unit of entry

  @Column(name = "UNI_EMP")
  private Double uniEmp; // Units per package

  @Column(name = "CTRL_ALM", length = 10)
  private String ctrlAlm; // Warehouse Control

  @Column(name = "TIEM_SURT")
  private Integer tiemSurt; // Supply Time

  @Column(name = "STOCK_MIN")
  private Double stockMin; // Minimum Stock

  @Column(name = "STOCK_MAX")
  private Double stockMax; // Maximum Stock

  @Column(name = "TIP_COSTEO", length = 1)
  private String tipCosteo; // Costing Type

  @Column(name = "NUM_MON")
  private Integer numMon; // Currency Number Key

  @Column(name = "FCH_ULTCOM")
  private LocalDateTime fchUltCom; // Last Purchase Date

  @Column(name = "COMP_X_REC")
  private Double compXRec; // Pending to receive

  @Column(name = "FCH_ULTVTA")
  private LocalDateTime fchUltVta; // Last Sale Date

  @Column(name = "PEND_SURT")
  private Double pendSurt; // Pending to supply

  @Column(name = "EXIST")
  private Double exist; // Existing Stock

  @Column(name = "COSTO_PROM")
  private Double costoProm; // Average Cost

  @Column(name = "ULT_COSTO")
  private Double ultCosto; // Last Cost

  @Column(name = "CVE_OBS")
  private Integer cveObs; // Observation Key

  @Column(name = "TIPO_ELE", length = 1)
  private String tipoEle; // Type of item (P=Product, S=Service, K=Kit, G=Group)

  @Column(name = "UNI_ALT", length = 10)
  private String uniAlt; // Alternative Unit

  @Column(name = "FAC_CONV")
  private Double facConv; // Conversion Factor between units (greater than 0)

  @Column(name = "APART")
  private Double apart; // Reserved

  @Column(name = "CON_LOTE", length = 1)
  private String conLote; // With Lot (S=Si [Yes], N=No)

  @Column(name = "CON_PEDIMENTO", length = 1)
  private String conPedimento; // With Customs Document (S=Si [Yes], N=No)

  @Column(name = "PESO")
  private Double peso; // Weight

  @Column(name = "VOLUMEN")
  private Double volumen; // Volume

  @Column(name = "CVE_ESQIMPU")
  private Integer cveEsqImpu; // Tax Scheme Key

  @Column(name = "CVE_BITA")
  private Integer cveBita; // Audit Key

  @Column(name = "VTAS_ANL_C")
  private Double vtasAnlC; // Annual Sales in currency

  @Column(name = "VTAS_ANL_M")
  private Double vtasAnlM; // Annual Sales in units

  @Column(name = "COMP_ANL_C")
  private Double compAnlC; // Annual Purchases in currency

  @Column(name = "COMP_ANL_M")
  private Double compAnlM; // Annual Purchases in units

  @Column(name = "PREFIJO", length = 8)
  private String prefijo; // Prefix

  @Column(name = "TALLA", length = 8)
  private String talla; // Size

  @Column(name = "COLOR", length = 8)
  private String color; // Color

  @Column(name = "CUENT_CONT", length = 28)
  private String cuentCont; // Accounting Account

  @Column(name = "CVE_IMAGEN", length = 16)
  private String cveImagen; // Image Key

  @Column(name = "BLK_CST_EXT", length = 1)
  private String blkCstExt; // External Cost Block

  @Column(name = "STATUS", length = 1)
  private String status; // Status

  @Column(name = "MAN_IEPS", length = 1)
  @Builder.Default
  private String manIeps = "N"; // IEPS Management (S=Si [Yes], N=No)

  @Column(name = "APL_MAN_IMP")
  @Builder.Default
  private Integer aplManImp = 1; // Import Management Application

  @Column(name = "CUOTA_IEPS")
  @Builder.Default
  private Double cuotaIeps = 0.0; // IEPS Quota

  @Column(name = "APL_MAN_IEPS", length = 1)
  @Builder.Default
  private String aplManIeps = "C"; // Mangement of IEPS [C/M/A]. C=Cuota, M=Mas alto, A=Ambos

  @Column(name = "UUID", length = 50)
  private String uuid; // UUID for sync SAE Movil

  @Column(name = "VERSION_SINC")
  private LocalDateTime versionSinc; // Date and hour SAE Movil sync version

  @Column(name = "VERSION_SINC_FECHA_IMG")
  private LocalDateTime versionSincFechaImg; // Date and hour SAE Movil sync image date

  @Column(name = "CVE_PRODSERV", length = 9)
  private String cveProdServ; // Product/Service Key (SAT)

  @Column(name = "CVE_UNIDAD", length = 4)
  private String cveUnidad; // Unit Key (SAT)

  @Column(name = "EDO_PUBL_ML", length = 1)
  private String edoPublMl; // Publication Status ML

  @Column(name = "CVE_PUBL_ML", length = 20)
  private String cvePublMl; // Publication Key ML

  @Column(name = "CONDICION_ML", length = 5)
  private String condicionMl; // Condition ML (New, Used)

  @Column(name = "TIPO_PUBL_ML", length = 12)
  private String tipoPublMl; // Publication Type ML (Free, Premium)

  @Column(name = "MODO_ENVIO_ML", length = 15)
  private String modoEnvioMl; // Shipping Mode ML (Mercado Envio, Not specified)

  @Column(name = "LARGO_ML")
  private Double largoMl; // Length ML

  @Column(name = "ALTO_ML")
  private Double altoMl; // Height ML

  @Column(name = "ANCHO_ML")
  private Double anchoMl; // Width ML

  @Column(name = "ENVIO_ML", length = 2)
  private String envioMl; // Free Shipping ML (Si [Yes], No)

  @Column(name = "CATEG_ML", length = 30)
  private String categMl; // Category ML

  @Column(name = "CAMPOS_CATEG_ML", length = 3000)
  private String camposCategMl; // Category Fields ML

  @Column(name = "DISPONIBLE_PUBL", length = 1)
  private String disponiblePubl; // Publication Available

  @Column(name = "CVE_CATE_ML", length = 20)
  private String cveCateMl; // Category Key ML

  @Column(name = "LAST_UPDATE_ML", length = 30)
  private String lastUpdateMl; // Last Update ML

  @Column(name = "F_CREA_ML")
  private LocalDateTime f_CreaMl; // Creation Date ML

  @Lob
  @Column(name = "IMAGEN_ML")
  private String imagenMl; // Image ML

  @Column(name = "ID_CATALOGO", length = 30)
  private String idCatalogo;

  @Column(name = "EN_CATALOGO", length = 1)
  private String enCatalogo;

  @Column(name = "TITULO_ML", length = 300)
  private String tituloMl;

  @Lob
  @Column(name = "MAT_PELI")
  private String matPeli;
}
