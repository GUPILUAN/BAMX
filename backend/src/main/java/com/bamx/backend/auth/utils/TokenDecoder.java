package com.bamx.backend.auth.utils;

import com.bamx.backend.auth.repositories.TokenBlockListRepository;
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
  private final TokenBlockListRepository tokenBlockListRepository;

  public TokenDecoder(String secret, TokenBlockListRepository tokenBlockListRepository) {
    this.key = generateKey(secret);
    this.tokenBlockListRepository = tokenBlockListRepository;
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
      List<String> permissions = List.of();
      if (!type.equals("refresh")) {
        rol = claims.get("rol").toString();
        empresa = "0" + claims.get("empresa").toString();
      }
      return new DecodedToken(
          claims.getSubject(),
          rol,
          empresa,
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

    tokenBlockListRepository
        .findByJti(decodedToken.jti())
        .ifPresent(
            blockedToken -> {
              throw new RevokedJwtException("Token has been revoked");
            });

    return decodedToken;
  }

  public boolean isAboutToExpire(DecodedToken token, long thresholdMillis) {
    long currentTimeMillis = System.currentTimeMillis();
    long expirationTimeMillis = token.expiration().toEpochSecond(ZoneOffset.UTC) * 1000;

    long remaining = expirationTimeMillis - currentTimeMillis;

    return remaining > 0 && remaining <= thresholdMillis;
  }
}
