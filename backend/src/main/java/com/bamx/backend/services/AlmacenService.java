package com.bamx.backend.services;

import com.bamx.backend.dtos.AlmacenDto;
import com.bamx.backend.mappers.AlmacenMapper;
import com.bamx.backend.repositories.AlmacenRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AlmacenService {

  private final AlmacenRepository almacenRepository;
  private final AlmacenMapper almacenMapper;

  public List<AlmacenDto> getAllAlmacenes() {
    return almacenMapper.toDtoList(almacenRepository.findAll());
  }
}
