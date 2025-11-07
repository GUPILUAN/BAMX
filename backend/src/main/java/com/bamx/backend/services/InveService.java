package com.bamx.backend.services;

import com.bamx.backend.dtos.InveDto;
import com.bamx.backend.mappers.InveMapper;
import com.bamx.backend.repositories.InveRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InveService {
  private final InveRepository inveRepository;
  private final InveMapper inveMapper;

  public List<InveDto> getAllInve() {
    return inveMapper.toDtoList(inveRepository.findAll());
  }
}
