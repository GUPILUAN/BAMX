package com.bamx.backend.dtos;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoteConImagenDto {
  String product_id;
  String product_name;
  String type_id;
  String type;
  String lot;
  Double available_quantity;
  LocalDateTime production_date;
  LocalDateTime expiration_date;
  LocalDateTime last_movement;
  Integer warehouse;
  String status;
  String image;
}
