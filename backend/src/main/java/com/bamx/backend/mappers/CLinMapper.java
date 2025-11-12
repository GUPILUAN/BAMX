package com.bamx.backend.mappers;

import com.bamx.backend.dtos.CLinDto;
import com.bamx.backend.models.CLin;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface CLinMapper {

  CLinDto toDto(CLin entity);

  CLin toEntity(CLinDto dto);

  List<CLinDto> toDtoList(List<CLin> entities);

  List<CLin> toEntityList(List<CLinDto> dtos);
}
