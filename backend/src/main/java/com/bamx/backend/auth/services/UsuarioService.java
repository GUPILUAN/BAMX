package com.bamx.backend.auth.services;

import com.bamx.backend.auth.dtos.InfoUsuario;
import com.bamx.backend.auth.models.FotoUsuario;
import com.bamx.backend.auth.models.Rol1005;
import com.bamx.backend.auth.models.TokenBlockList;
import com.bamx.backend.auth.models.UsrEmp;
import com.bamx.backend.auth.models.Usuario;
import com.bamx.backend.auth.repositories.FotoUsuarioRepository;
import com.bamx.backend.auth.repositories.Rol1005Repository;
import com.bamx.backend.auth.repositories.TokenBlockListRepository;
import com.bamx.backend.auth.repositories.UsrEmpRepository;
import com.bamx.backend.auth.repositories.UsuarioRepository;
import com.bamx.backend.auth.utils.AspelHash;
import com.bamx.backend.auth.utils.TokenDecoder;
import com.bamx.backend.dtos.DecodedToken;
import com.bamx.backend.dtos.request.LoginRequest;
import com.bamx.backend.dtos.response.LoginResponse;
import com.bamx.backend.exception.Exception.InvalidCredentialsException;
import com.bamx.backend.exception.Exception.UserNotFoundException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import java.security.Key;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UsuarioService {
  private final UsuarioRepository usuarioRepository;
  private final TokenBlockListRepository tokenBlockListRepository;
  private final UsrEmpRepository usrEmpRepository;
  private final FotoUsuarioRepository fotoUsuarioRepository;
  private final Rol1005Repository rol1005Repository;

  @Value("${jwt.secret}")
  private String jwtSecret;

  @Value("${jwt.access-token-expiration}")
  private long jwtExpiration;

  @Value("${jwt.refresh-token-expiration}")
  private long jwtRefreshExpiration;

  private Key key;
  private TokenDecoder tokenDecoder;

  @PostConstruct
  public void init() {
    this.tokenDecoder = new TokenDecoder(jwtSecret, tokenBlockListRepository);
    this.key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
  }

  public InfoUsuario findById(@NonNull Integer id) {
    Usuario usuario =
        usuarioRepository
            .findById(id)
            .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
    FotoUsuario fotoUsuario = fotoUsuarioRepository.findById(id).orElse(null);
    byte[] foto = fotoUsuario != null ? fotoUsuario.getFotografia() : null;
    UsrEmp usrEmp =
        usrEmpRepository
            .findByIdUsr(id)
            .orElseThrow(() -> new UserNotFoundException("No user-company association found."));

    Integer idRol = usrEmp.getIdRol();
    if (idRol == null) {
      throw new UserNotFoundException("No role found for the user.");
    }
    Rol1005 rol1005 =
        rol1005Repository
            .findById(idRol)
            .orElseThrow(() -> new UserNotFoundException("No role found for the user."));

    return InfoUsuario.builder()
        .idUsr(usuario.getIdUsr())
        .usuario(usuario.getUsuario())
        .nombre(usuario.getNombre())
        .mail(usuario.getMail())
        .puesto(usuario.getPuesto())
        .depto(usuario.getDepto())
        .empresa(usrEmp.getEmpresa())
        .rol(rol1005.getNombre())
        .fotografia(foto)
        .build();
  }

  public LoginResponse login(LoginRequest loginRequest) {
    Usuario usuario =
        usuarioRepository
            .findByUsuario(loginRequest.getUsername())
            .orElseThrow(
                () -> new UserNotFoundException("No user found with the provided username."));
    if (AspelHash.verifyPassword(loginRequest.getPassword(), usuario.getPass())) {
      String token = generateAccessJwtToken(usuario);
      String refreshToken = generateRefreshJwtToken(usuario);
      return new LoginResponse(token, refreshToken);
    }
    throw new InvalidCredentialsException("Invalid email or password.");
  }

  public LoginResponse refreshToken(String authHeader) {
    DecodedToken token = tokenDecoder.validateAndExtractToken(authHeader, "refresh");
    Usuario usuario =
        usuarioRepository
            .findByUsuario(token.usuario())
            .orElseThrow(() -> new UserNotFoundException("No user found with the provided email."));
    String newAccessToken = generateAccessJwtToken(usuario);
    String newRefreshToken =
        tokenDecoder.isAboutToExpire(token, 86400000L) // 1 day
            ? generateRefreshJwtToken(usuario)
            : null;
    return new LoginResponse(newAccessToken, newRefreshToken);
  }

  public boolean logout(String authHeader) {
    DecodedToken token = tokenDecoder.validateAndExtractToken(authHeader, "refresh");
    Usuario usuario =
        usuarioRepository
            .findByUsuario(token.usuario())
            .orElseThrow(() -> new UserNotFoundException("No user found with the provided email."));
    TokenBlockList blockedToken =
        TokenBlockList.builder()
            .jti(token.jti())
            .expiresAt(token.expiration())
            .revokedAt(LocalDateTime.now())
            .tokenType(token.type())
            .idUsr(usuario.getIdUsr())
            .build();

    if (blockedToken == null) {
      return false;
    }

    return tokenBlockListRepository.save(blockedToken) != null;
  }

  private String generateAccessJwtToken(Usuario usuario) {
    long now = System.currentTimeMillis();
    UsrEmp usrEmp =
        usrEmpRepository
            .findByIdUsr(usuario.getIdUsr())
            .orElseThrow(() -> new UserNotFoundException("No user-company association found."));

    Integer idRol = usrEmp.getIdRol();
    if (idRol == null) {
      throw new UserNotFoundException("No role found for the user.");
    }
    Rol1005 rol1005 =
        rol1005Repository
            .findById(idRol)
            .orElseThrow(() -> new UserNotFoundException("No role found for the user."));

    return Jwts.builder()
        .setId(UUID.randomUUID().toString().toUpperCase())
        .setSubject(usuario.getUsuario())
        .setIssuedAt(new java.util.Date(now))
        .setExpiration(new java.util.Date(now + jwtExpiration))
        .claim("type", "access")
        .claim("rol", rol1005.getNombre())
        .claim("empresa", usrEmp.getEmpresa().toString().trim())
        .signWith(key)
        .compact();
  }

  private String generateRefreshJwtToken(Usuario usuario) {
    long now = System.currentTimeMillis();
    return Jwts.builder()
        .setId(UUID.randomUUID().toString().toUpperCase())
        .setSubject(usuario.getUsuario())
        .setIssuedAt(new java.util.Date(now))
        .setExpiration(new java.util.Date(now + jwtRefreshExpiration))
        .claim("type", "refresh")
        .signWith(key)
        .compact();
  }
}
