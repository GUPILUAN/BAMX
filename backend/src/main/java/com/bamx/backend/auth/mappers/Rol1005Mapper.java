package com.bamx.backend.auth.mappers;

import com.bamx.backend.auth.dtos.Rol1005Dto;
import com.bamx.backend.auth.models.Rol1005;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface Rol1005Mapper {
  Rol1005Dto toDto(Rol1005 rol1005);

  Rol1005 toEntity(Rol1005Dto dto);

  List<Rol1005Dto> toDtoList(List<Rol1005> rol1005List);

  List<Rol1005> toEntityList(List<Rol1005Dto> dtoList);
}
