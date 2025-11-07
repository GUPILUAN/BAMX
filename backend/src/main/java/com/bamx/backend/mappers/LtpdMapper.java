package com.bamx.backend.mappers;

import com.bamx.backend.dtos.LtpdDto;
import com.bamx.backend.models.Ltpd;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface LtpdMapper {

  LtpdDto toDto(Ltpd entity);

  Ltpd toEntity(LtpdDto dto);

  List<LtpdDto> toDtoList(List<Ltpd> entities);

  List<Ltpd> toEntityList(List<LtpdDto> dtos);
}
