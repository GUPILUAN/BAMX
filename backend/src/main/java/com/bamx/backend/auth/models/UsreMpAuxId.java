package com.bamx.backend.auth.models;

import jakarta.persistence.*;
import java.io.Serializable;
import lombok.*;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsreMpAuxId implements Serializable {

  @Column(name = "IDUSR", nullable = false)
  private Integer idUsr;

  @Column(name = "IDSIST", nullable = false)
  private Integer idSist;

  @Column(name = "EMPRESA", nullable = false)
  private Integer empresa;
}
