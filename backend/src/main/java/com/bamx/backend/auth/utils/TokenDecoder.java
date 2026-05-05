package com.bamx.backend.auth.utils;

import com.bamx.backend.auth.services.TokenBlockListService;
import com.bamx.backend.dtos.DecodedToken;
import com.bamx.backend.exception.Exception.RevokedJwtException;
import com.bamx.backend.exception.Exception.TokenDecodeException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.List;

public class TokenDecoder {

  private final Key key;
  private final TokenBlockListService tokenBlockListService;

  public TokenDecoder(String secret, TokenBlockListService tokenBlockListService) {
    this.key = generateKey(secret);
    this.tokenBlockListService = tokenBlockListService;
  }

  private Key generateKey(String secret) {
    return Keys.hmacShaKeyFor(secret.getBytes());
  }

  public DecodedToken decodeToken(String authHeader) {
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      throw new TokenDecodeException("Invalid Authorization header format");
    }
    String token = authHeader.substring(7);
    try {
      Claims claims =
          Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
      String jti = claims.getId();
      String type = claims.get("type", String.class);
      String rol = "";
      String empresa = "";
      Integer status = 0;
      List<String> permissions = List.of();
      if (!type.equals("refresh")) {
        rol = claims.get("rol").toString();
        empresa = normalizeEmpresa(claims.get("empresa").toString());
        status = Integer.parseInt(claims.get("status").toString());
      }
      return new DecodedToken(
          claims.getSubject(),
          rol,
          empresa,
          status,
          claims.getIssuedAt().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime(),
          claims.getExpiration().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime(),
          jti,
          type,
          permissions);
    } catch (ExpiredJwtException e) {
      throw new TokenDecodeException("Failed to decode token (expired)", e);
    } catch (MalformedJwtException e) {
      throw new TokenDecodeException("Failed to decode token (malformed)", e);
    } catch (Exception e) {
      throw new TokenDecodeException("Failed to decode token (unknown) : " + e.getMessage(), e);
    }
  }

  private String normalizeEmpresa(String empresa) {
    String normalized = empresa == null ? "" : empresa.trim();
    return normalized.length() == 1 ? "0" + normalized : normalized;
  }

  public DecodedToken validateAndExtractToken(String authHeader, String expectedType) {
    DecodedToken decodedToken = decodeToken(authHeader);

    if (decodedToken == null) {
      throw new TokenDecodeException("Invalid token");
    }

    if (!decodedToken.type().equals(expectedType)) {
      throw new TokenDecodeException("Token type mismatch");
    }

    if (decodedToken.isExpired()) {
      throw new TokenDecodeException("Token has expired");
    }

    if (decodedToken.jti() == null || decodedToken.jti().isBlank()) {
      throw new TokenDecodeException("Token jti is missing");
    }

    if (decodedToken.usuario() == null || decodedToken.usuario().isBlank()) {
      throw new TokenDecodeException("Token subject is missing");
    }

    if (decodedToken.type() == null || decodedToken.type().isBlank()) {
      throw new TokenDecodeException("Token type is missing");
    }

    if (decodedToken.issuedAt() == null) {
      throw new TokenDecodeException("Token issuedAt is missing");
    }

    if (decodedToken.expiration() == null) {
      throw new TokenDecodeException("Token expiration is missing");
    }

    if (decodedToken.type().equals("access")
        && (decodedToken.rol() == null || decodedToken.rol().isBlank())) {
      throw new TokenDecodeException("Token role is missing");
    }
    if (decodedToken.type().equals("access")
        && (decodedToken.empresa() == null || decodedToken.empresa().isBlank())) {
      throw new TokenDecodeException("Token company is missing");
    }

    if (decodedToken.type().equals("access") && decodedToken.status() == 0) {
      throw new TokenDecodeException("Status is inactive");
    }

    if (tokenBlockListService.isRevoked(decodedToken.jti())) {
      throw new RevokedJwtException("Token has been revoked");
    }

    return decodedToken;
  }

  public boolean isAboutToExpire(DecodedToken token, long thresholdMillis) {
    long currentTimeMillis = System.currentTimeMillis();
    long expirationTimeMillis = token.expiration().toEpochSecond(ZoneOffset.UTC) * 1000;

    long remaining = expirationTimeMillis - currentTimeMillis;

    return remaining > 0 && remaining <= thresholdMillis;
  }
}
