package com.bamx.backend.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "PAIS")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Pais {

  @Id
  @Column(name = "CVE_PAIS", length = 2, nullable = false)
  private String cvePais; // Country Key

  @Column(name = "DESCR", length = 120)
  private String descr; // Description
}
