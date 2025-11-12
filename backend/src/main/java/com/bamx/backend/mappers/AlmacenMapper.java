package com.bamx.backend.mappers;

import com.bamx.backend.dtos.AlmacenDto;
import com.bamx.backend.models.Almacen;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface AlmacenMapper {

  AlmacenDto toDto(Almacen almacen);

  Almacen toEntity(AlmacenDto dto);

  List<AlmacenDto> toDtoList(List<Almacen> almacenes);

  List<Almacen> toEntityList(List<AlmacenDto> dtos);
}
