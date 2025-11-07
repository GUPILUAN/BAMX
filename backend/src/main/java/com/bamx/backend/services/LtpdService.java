package com.bamx.backend.services;

import com.bamx.backend.dtos.LtpdDto;
import com.bamx.backend.mappers.LtpdMapper;
import com.bamx.backend.repositories.LtpdRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LtpdService {
  private final LtpdRepository ltpdRepository;
  private final LtpdMapper ltpdMapper;

  public List<LtpdDto> getAllLtpd() {
    return ltpdMapper.toDtoList(ltpdRepository.findAll());
  }
}
