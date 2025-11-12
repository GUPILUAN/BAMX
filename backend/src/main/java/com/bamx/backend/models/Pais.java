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
