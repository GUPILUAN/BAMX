package com.bamx.backend.mappers;

import com.bamx.backend.dtos.TblControlDto;
import com.bamx.backend.models.TblControl;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface TblControlMapper {
  TblControlDto toDto(TblControl entity);

  TblControl toEntity(TblControlDto dto);

  List<TblControlDto> toDtoList(List<TblControl> entities);

  List<TblControl> toEntityList(List<TblControlDto> dtos);
}
