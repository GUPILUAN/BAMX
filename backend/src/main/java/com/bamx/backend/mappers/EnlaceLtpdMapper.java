package com.bamx.backend.mappers;

import com.bamx.backend.dtos.EnlaceLtpdDto;
import com.bamx.backend.models.EnlaceLtpd;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface EnlaceLtpdMapper {
  EnlaceLtpdDto toDto(EnlaceLtpd entity);

  EnlaceLtpd toEntity(EnlaceLtpdDto dto);

  List<EnlaceLtpdDto> toDtoList(List<EnlaceLtpd> entities);

  List<EnlaceLtpd> toEntityList(List<EnlaceLtpdDto> dtos);
}
