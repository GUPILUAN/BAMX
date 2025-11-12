package com.bamx.backend.security;

import com.bamx.backend.auth.models.Usuario;
import com.bamx.backend.auth.repositories.UsuarioRepository;
import com.bamx.backend.dtos.DecodedToken;
import com.bamx.backend.exception.Exception.UserNotFoundException;
import java.util.Collection;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Getter
public class UserDetailsImpl implements UserDetails {
  private final Integer id;
  private final String username;
  private final Collection<? extends GrantedAuthority> authorities;

  public UserDetailsImpl(DecodedToken decodedToken, UsuarioRepository usuarioRepository) {
    this.username = decodedToken.usuario();
    Usuario userEntity =
        usuarioRepository
            .findByUsuario(decodedToken.usuario())
            .orElseThrow(
                () ->
                    new UserNotFoundException(
                        "User not found with usuario: " + decodedToken.usuario()));
    this.id = userEntity.getIdUsr();
    this.authorities =
        decodedToken.permissions().stream().map(SimpleGrantedAuthority::new).toList();
  }

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return authorities;
  }

  @Override
  public String getPassword() {
    return null;
  }

  @Override
  public String getUsername() {
    return username;
  }
}
