package com.bamx.backend.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "CVES_ALTER")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@IdClass(CvesAlterId.class)
public class CvesAlter {

  @Id
  @Column(name = "CVE_ART", length = 16, nullable = false)
  private String cveArt; // Article Key

  @Id
  @Column(name = "CVE_ALTER", length = 16, nullable = false)
  private String cveAlter; // Alternate Article Key

  @Column(name = "TIPO", length = 1)
  private String tipo; // Type

  @Column(name = "CVE_CLPV", length = 10)
  private String cveClpv; // Client / Supplier Key  (if applicable)
}
