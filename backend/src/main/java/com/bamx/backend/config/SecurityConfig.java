package com.bamx.backend.config;

import com.bamx.backend.auth.repositories.TokenBlockListRepository;
import com.bamx.backend.auth.repositories.UsuarioRepository;
import com.bamx.backend.auth.utils.TokenDecoder;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

@Configuration
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

  private final UsuarioRepository usuarioRepository;
  private final TokenBlockListRepository tokenBlockListRepository;

  @Value("${jwt.secret}")
  private String jwtSecret;

  @Bean
  public BCryptPasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  public JwtAuthenticationFilter jwtAuthenticationFilter() {
    return new JwtAuthenticationFilter(
        new TokenDecoder(jwtSecret, tokenBlockListRepository), usuarioRepository);
  }

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http.csrf(AbstractHttpConfigurer::disable)
        .cors(
            cors ->
                cors.configurationSource(
                    _ -> {
                      CorsConfiguration configuration = new CorsConfiguration();
                      configuration.setAllowCredentials(false);
                      configuration.addAllowedOrigin("*");
                      configuration.addAllowedHeader("*");
                      configuration.addAllowedMethod("*");
                      configuration.setMaxAge(3600L);
                      return configuration;
                    }))
        .securityMatcher("/**")
        .sessionManagement(
            session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .formLogin(AbstractHttpConfigurer::disable)
        .authorizeHttpRequests(
            request -> request.requestMatchers("/**").permitAll().anyRequest().authenticated())
        .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
    return http.build();
  }
}
