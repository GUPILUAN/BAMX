package com.bamx.backend.mappers;

import com.bamx.backend.dtos.MInveDto;
import com.bamx.backend.models.MInve;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface MInveMapper {
  MInveDto toDto(MInve entity);

  MInve toEntity(MInveDto dto);

  List<MInveDto> toDtoList(List<MInve> entities);

  List<MInve> toEntityList(List<MInveDto> dtos);
}
