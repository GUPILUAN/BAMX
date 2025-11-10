package com.bamx.backend.models;

import java.io.Serializable;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EnlaceLtpdId implements Serializable {
  private Integer eLtpd;
  private Integer regLtpd;
}
