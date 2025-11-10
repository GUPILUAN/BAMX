package com.bamx.backend.models;

import java.io.Serializable;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CvesAlterId implements Serializable {

  private String cveArt;
  private String cveAlter;
}
