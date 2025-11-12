package com.bamx.backend.mappers;

import com.bamx.backend.dtos.MultDto;
import com.bamx.backend.models.Mult;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface MultMapper {
  MultDto toDto(Mult entity);

  Mult toEntity(MultDto dto);

  List<MultDto> toDtoList(List<Mult> entities);

  List<Mult> toEntityList(List<MultDto> dtos);
}
