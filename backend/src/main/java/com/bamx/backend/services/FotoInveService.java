package com.bamx.backend.services;

import com.bamx.backend.dtos.FotoInveDto;
import com.bamx.backend.mappers.FotoInveMapper;
import com.bamx.backend.repositories.FotoInveRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FotoInveService {
  private final FotoInveRepository fotoInveRepository;
  private final FotoInveMapper fotoInveMapper;

  public List<FotoInveDto> getAllFotoInve() {
    return fotoInveMapper.toDtoList(fotoInveRepository.findAll());
  }
}
