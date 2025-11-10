package com.bamx.backend.auth.services;

import com.bamx.backend.auth.repositories.FotoUsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FotoUsuarioService {
  private final FotoUsuarioRepository fotoUsuarioRepository;

  public byte[] getFotoByUsuarioId(Integer usuarioId) {
    return usuarioId == null
        ? null
        : fotoUsuarioRepository
            .findById(usuarioId)
            .map(fotoUsuario -> fotoUsuario.getFotografia())
            .orElse(null);
  }

  public boolean hasProfilePicture(Integer usuarioId) {
    return fotoUsuarioRepository.existsByIdUsr(usuarioId);
  }
}
