package com.bamx.backend.auth.utils;

import com.bamx.backend.security.UserDetailsImpl;
import org.springframework.security.core.Authentication;

public class AuthUtils {
  public static Integer getCurrentUserId(Authentication authentication) {
    if (authentication == null || authentication.getPrincipal() == null) {
      return null;
    }
    UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
    return userDetails.getId();
  }
}
