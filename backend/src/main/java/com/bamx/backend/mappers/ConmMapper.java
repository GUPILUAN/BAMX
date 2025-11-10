package com.bamx.backend.mappers;

import com.bamx.backend.dtos.ConmDto;
import com.bamx.backend.models.Conm;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface ConmMapper {
  ConmDto toDto(Conm entity);

  Conm toEntity(ConmDto dto);

  List<ConmDto> toDtoList(List<Conm> entities);

  List<Conm> toEntityList(List<ConmDto> dtos);
}
