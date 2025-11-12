package com.bamx.backend.dtos;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProvDto {
  private String clave;
  private String status;
  private String nombre;
  private String rfc;
  private String calle;
  private String numInt;
  private String numExt;
  private String cruzaMientos;
  private String cruzaMientos2;
  private String colonia;
  private String codigo;
  private String localidad;
  private String municipio;
  private String estado;
  private String cvePais;
  private String nacionalidad;
  private String telefono;
  private String clasificacion;
  private String fax;
  private String pagWeb;
  private String curp;
  private String cveZona;
  private String conCredito;
  private Integer diasCred;
  private Double limCred;
  private Integer cveBita;
  private String ultPagoD;
  private Double ultPagoM;
  private LocalDateTime ultPagoF;
  private String ultCompD;
  private Double ultCompM;
  private LocalDateTime ultCompF;
  private Double saldo;
  private Double ventas;
  private Double descuento;
  private Integer tipTercero;
  private Integer tipOpera;
  private Integer cveObs;
  private String cuentaContable;
  private Integer formaPago;
  private String beneficiario;
  private String titularCuenta;
  private String banco;
  private String sucursalBanco;
  private String cuentaBanco;
  private String clabe;
  private String descOtros;
  private String imprir;
  private String mail;
  private Integer nivelSec;
  private String envioSilen;
  private String emailPred;
  private String modelo;
  private Double lat;
  private Double lon;
  private Integer valRfc;
  private String regFisc;
}
