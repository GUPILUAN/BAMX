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
  private String cveArt;

  @Column(name = "DESCR", length = 40)
  private String descr;

  @Column(name = "LIN_PROD", length = 5)
  private String linProd;

  @Column(name = "CON_SERIE", length = 1)
  private String conSerie;

  @Column(name = "UNI_MED", length = 10)
  private String uniMed;

  @Column(name = "UNI_EMP")
  private Double uniEmp;

  @Column(name = "CTRL_ALM", length = 10)
  private String ctrlAlm;

  @Column(name = "TIEM_SURT")
  private Integer tiemSurt;

  @Column(name = "STOCK_MIN")
  private Double stockMin;

  @Column(name = "STOCK_MAX")
  private Double stockMax;

  @Column(name = "TIP_COSTEO", length = 1)
  private String tipCosteo;

  @Column(name = "NUM_MON")
  private Integer numMon;

  @Column(name = "FCH_ULTCOM")
  private LocalDateTime fchUltCom;

  @Column(name = "COMP_X_REC")
  private Double compXRec;

  @Column(name = "FCH_ULTVTA")
  private LocalDateTime fchUltVta;

  @Column(name = "PEND_SURT")
  private Double pendSurt;

  @Column(name = "EXIST")
  private Double exist;

  @Column(name = "COSTO_PROM")
  private Double costoProm;

  @Column(name = "ULT_COSTO")
  private Double ultCosto;

  @Column(name = "CVE_OBS")
  private Integer cveObs;

  @Column(name = "TIPO_ELE", length = 1)
  private String tipoEle;

  @Column(name = "UNI_ALT", length = 10)
  private String uniAlt;

  @Column(name = "FAC_CONV")
  private Double facConv;

  @Column(name = "APART")
  private Double apart;

  @Column(name = "CON_LOTE", length = 1)
  private String conLote;

  @Column(name = "CON_PEDIMENTO", length = 1)
  private String conPedimento;

  @Column(name = "PESO")
  private Double peso;

  @Column(name = "VOLUMEN")
  private Double volumen;

  @Column(name = "CVE_ESQIMPU")
  private Integer cveEsqImpu;

  @Column(name = "CVE_BITA")
  private Integer cveBita;

  @Column(name = "VTAS_ANL_C")
  private Double vtasAnlC;

  @Column(name = "VTAS_ANL_M")
  private Double vtasAnlM;

  @Column(name = "COMP_ANL_C")
  private Double compAnlC;

  @Column(name = "COMP_ANL_M")
  private Double compAnlM;

  @Column(name = "PREFIJO", length = 8)
  private String prefijo;

  @Column(name = "TALLA", length = 8)
  private String talla;

  @Column(name = "COLOR", length = 8)
  private String color;

  @Column(name = "CUENT_CONT", length = 28)
  private String cuentCont;

  @Column(name = "CVE_IMAGEN", length = 16)
  private String cveImagen;

  @Column(name = "BLK_CST_EXT", length = 1)
  private String blkCstExt;

  @Column(name = "STATUS", length = 1)
  private String status;

  @Column(name = "MAN_IEPS", length = 1)
  private String manIeps;

  @Column(name = "APL_MAN_IMP")
  private Integer aplManImp;

  @Column(name = "CUOTA_IEPS")
  private Double cuotaIeps;

  @Column(name = "APL_MAN_IEPS", length = 1)
  private String aplManIeps;

  @Column(name = "UUID", length = 50)
  private String uuid;

  @Column(name = "VERSION_SINC")
  private LocalDateTime versionSinc;

  @Column(name = "VERSION_SINC_FECHA_IMG")
  private LocalDateTime versionSincFechaImg;

  @Column(name = "CVE_PRODSERV", length = 9)
  private String cveProdServ;

  @Column(name = "CVE_UNIDAD", length = 4)
  private String cveUnidad;

  @Column(name = "EDO_PUBL_ML", length = 1)
  private String edoPublMl;

  @Column(name = "CVE_PUBL_ML", length = 20)
  private String cvePublMl;

  @Column(name = "CONDICION_ML", length = 5)
  private String condicionMl;

  @Column(name = "TIPO_PUBL_ML", length = 12)
  private String tipoPublMl;

  @Column(name = "MODO_ENVIO_ML", length = 15)
  private String modoEnvioMl;

  @Column(name = "LARGO_ML")
  private Double largoMl;

  @Column(name = "ALTO_ML")
  private Double altoMl;

  @Column(name = "ANCHO_ML")
  private Double anchoMl;

  @Column(name = "ENVIO_ML", length = 2)
  private String envioMl;

  @Column(name = "CATEG_ML", length = 30)
  private String categMl;

  @Column(name = "CAMPOS_CATEG_ML", length = 3000)
  private String camposCategMl;

  @Column(name = "DISPONIBLE_PUBL", length = 1)
  private String disponiblePubl;

  @Column(name = "CVE_CATE_ML", length = 20)
  private String cveCateMl;

  @Column(name = "LAST_UPDATE_ML", length = 30)
  private String lastUpdateMl;

  @Column(name = "F_CREA_ML")
  private LocalDateTime f_CreaMl;

  @Lob
  @Column(name = "IMAGEN_ML")
  private String imagenMl;

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
