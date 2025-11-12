package com.bamx.backend.mappers;

import com.bamx.backend.dtos.FotoInveDto;
import com.bamx.backend.models.FotoInve;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface FotoInveMapper {

  FotoInveDto toDto(FotoInve fotoInve);

  FotoInve toEntity(FotoInveDto fotoInveDto);

  List<FotoInveDto> toDtoList(List<FotoInve> fotoInveList);

  List<FotoInve> toEntityList(List<FotoInveDto> fotoInveDtoList);
}
