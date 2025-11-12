package com.bamx.backend.mappers;

import com.bamx.backend.dtos.CvesAlterDto;
import com.bamx.backend.models.CvesAlter;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface CvesAlterMapper {
  CvesAlterDto toDto(CvesAlter entity);

  CvesAlter toEntity(CvesAlterDto dto);

  List<CvesAlterDto> toDtoList(List<CvesAlter> entities);

  List<CvesAlter> toEntityList(List<CvesAlterDto> dtos);
}
