package com.bamx.backend.mappers;

import com.bamx.backend.dtos.ProvDto;
import com.bamx.backend.models.Prov;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface ProvMapper {
  ProvDto toDto(Prov entity);

  Prov toEntity(ProvDto dto);

  List<ProvDto> toDtoList(List<Prov> entities);

  List<Prov> toEntityList(List<ProvDto> dtos);
}
