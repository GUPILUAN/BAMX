package com.bamx.backend.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "FOTO_INVE")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FotoInve {

  @Id
  @Column(name = "CVE_ART", length = 16, nullable = false)
  private String cveArt; // Article Key

  @Lob
  @Column(name = "FOTO")
  private byte[] foto; // Photo (image data)
}
