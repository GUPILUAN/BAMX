package com.bamx.backend.auth.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "USREMPAUX")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsreMpAux {

  @EmbeddedId private UsreMpAuxId id;

  @Column(name = "IDROL")
  private Integer idRol;

  @Column(name = "STATUS")
  private Integer status;
}
