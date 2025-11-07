package com.bamx.backend.config;

import com.bamx.backend.auth.repositories.UsuarioRepository;
import com.bamx.backend.auth.utils.TokenDecoder;
import com.bamx.backend.dtos.DecodedToken;
import com.bamx.backend.exception.Exception.TokenDecodeException;
import com.bamx.backend.security.UserDetailsImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.server.ResponseStatusException;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private final TokenDecoder tokenDecoder;
  private final UsuarioRepository usuarioRepository;

  public JwtAuthenticationFilter(TokenDecoder tokenDecoder, UsuarioRepository usuarioRepository) {
    this.tokenDecoder = tokenDecoder;
    this.usuarioRepository = usuarioRepository;
  }

  public static final ThreadLocal<String> currentTenant = new ThreadLocal<>();

  @Override
  protected boolean shouldNotFilter(@NonNull HttpServletRequest request) throws ServletException {
    String path = request.getRequestURI();
    return path.equals("/api/usuarios/register")
        || path.equals("/api/usuarios/login")
        || path.equals("/api/usuarios/refresh-token")
        || path.startsWith("/api/public/")
        || path.contains("swagger-ui")
        || path.contains("api-docs");
  }

  @Override
  protected void doFilterInternal(
      @NonNull HttpServletRequest request,
      @NonNull HttpServletResponse response,
      @NonNull FilterChain filterChain)
      throws ServletException, IOException {
    String authHeader = request.getHeader("Authorization");
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
      response.getWriter().write("Missing or invalid Authorization header");
      return;
    }
    try {
      DecodedToken decodedToken = tokenDecoder.decodeToken(authHeader);
      EmpresaPhysicalNamingStrategy.setEmpresa(decodedToken.empresa());
      if (decodedToken != null) {
        UserDetailsImpl userDetails = new UserDetailsImpl(decodedToken, usuarioRepository);
        UsernamePasswordAuthenticationToken authenticationToken =
            new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
      }
      filterChain.doFilter(request, response);
    } catch (TokenDecodeException ex) {
      response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
      response.setContentType("application/json");
      response.getWriter().write("Invalid or expired token: " + ex.getMessage());
    } catch (ResponseStatusException ex) {
      response.setStatus(ex.getStatusCode().value());
      response.setContentType("application/json");
      response.getWriter().write("Authentication error: " + ex.getReason());
    } catch (Exception ex) {
      response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
      response.setContentType("application/json");
      response.getWriter().write("Internal server error: " + ex.getMessage());
    } finally {
      EmpresaPhysicalNamingStrategy.clear();
    }
  }
}
