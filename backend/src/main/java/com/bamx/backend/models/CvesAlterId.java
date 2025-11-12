package com.bamx.backend.models;

import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CvesAlterId implements Serializable {

  private String cveArt;
  private String cveAlter;
}
