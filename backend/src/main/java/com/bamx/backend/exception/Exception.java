package com.bamx.backend.exception;

public class Exception {
  public static class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String message) {
      super(message);
    }
  }

  public static class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
      super(message);
    }
  }

  public static class InvalidCredentialsException extends RuntimeException {
    public InvalidCredentialsException(String message) {
      super(message);
    }
  }

  public static class UnauthorizedAccessException extends RuntimeException {
    public UnauthorizedAccessException(String message) {
      super(message);
    }
  }

  public static class ResourceConflictException extends RuntimeException {
    public ResourceConflictException(String message) {
      super(message);
    }
  }

  public static class TokenDecodeException extends RuntimeException {
    public TokenDecodeException(String message) {
      super(message);
    }

    public TokenDecodeException(String message, Throwable cause) {
      super(message, cause);
    }
  }

  public static class RevokedJwtException extends RuntimeException {
    public RevokedJwtException(String message) {
      super(message);
    }
  }
}
