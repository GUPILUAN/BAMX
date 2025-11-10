package com.bamx.backend.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "TBLCONTROL")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TblControl {

  @Id
  @Column(name = "ID_TABLA", nullable = false)
  private Integer idTabla; // Table ID

  @Column(name = "ULT_CVE")
  private Integer ultCve; // Last Key
}
