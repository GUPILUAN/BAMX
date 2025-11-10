package com.bamx.backend.mappers;

import com.bamx.backend.dtos.PaisDto;
import com.bamx.backend.models.Pais;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface PaisMapper {
  PaisDto toDto(Pais entity);

  Pais toEntity(PaisDto dto);

  List<PaisDto> toDtoList(List<Pais> entities);

  List<Pais> toEntityList(List<PaisDto> dtos);
}
