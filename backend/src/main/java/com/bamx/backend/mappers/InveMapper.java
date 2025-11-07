package com.bamx.backend.mappers;

import com.bamx.backend.dtos.InveDto;
import com.bamx.backend.models.Inve;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface InveMapper {

  InveDto toDto(Inve entity);

  Inve toEntity(InveDto dto);

  List<InveDto> toDtoList(List<Inve> entities);

  List<Inve> toEntityList(List<InveDto> dtos);
}
