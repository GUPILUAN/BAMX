package com.bamx.backend.mappers;

import com.bamx.backend.dtos.NumSerDto;
import com.bamx.backend.models.NumSer;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface NumSerMapper {
  NumSerDto toDto(NumSer entity);

  NumSer toEntity(NumSerDto dto);

  List<NumSerDto> toDtoList(List<NumSer> entities);

  List<NumSer> toEntityList(List<NumSerDto> dtos);
}
