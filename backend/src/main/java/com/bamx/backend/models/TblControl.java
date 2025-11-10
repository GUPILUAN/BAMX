package com.bamx.backend.models;

import jakarta.persistence.*;
import lombok.*;

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
