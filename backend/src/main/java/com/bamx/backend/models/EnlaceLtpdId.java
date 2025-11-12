package com.bamx.backend.models;

import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EnlaceLtpdId implements Serializable {
  private Integer e_Ltpd;
  private Integer regLtpd;
}
