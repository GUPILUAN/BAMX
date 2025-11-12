package com.bamx.backend.exception;

import com.bamx.backend.dtos.response.ErrorResponse;
import com.bamx.backend.exception.Exception.*;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.ValidationException;
import java.util.HashMap;
import java.util.Map;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(UserNotFoundException.class)
  public ResponseEntity<ErrorResponse> handleUserNotFoundException(UserNotFoundException ex) {
    HttpStatus status = HttpStatus.NOT_FOUND;
    ErrorResponse errorResponse = new ErrorResponse(status.value(), ex.getMessage());
    return new ResponseEntity<>(errorResponse, status);
  }

  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<ErrorResponse> handleResourceNotFoundException(
      ResourceNotFoundException ex) {
    HttpStatus status = HttpStatus.NOT_FOUND;
    ErrorResponse errorResponse = new ErrorResponse(status.value(), ex.getMessage());
    return new ResponseEntity<>(errorResponse, status);
  }

  @ExceptionHandler(InvalidCredentialsException.class)
  public ResponseEntity<ErrorResponse> handleInvalidCredentialsException(
      InvalidCredentialsException ex) {
    HttpStatus status = HttpStatus.UNAUTHORIZED;
    ErrorResponse errorResponse = new ErrorResponse(status.value(), ex.getMessage());
    return new ResponseEntity<>(errorResponse, status);
  }

  @ExceptionHandler(UnauthorizedAccessException.class)
  public ResponseEntity<ErrorResponse> handleUnauthorizedAccessException(
      UnauthorizedAccessException ex) {
    HttpStatus status = HttpStatus.UNAUTHORIZED;
    ErrorResponse errorResponse = new ErrorResponse(status.value(), ex.getMessage());
    return new ResponseEntity<>(errorResponse, status);
  }

  @ExceptionHandler(AuthorizationDeniedException.class)
  public ResponseEntity<ErrorResponse> handleAuthorizationDeniedException(
      AuthorizationDeniedException ex) {
    HttpStatus status = HttpStatus.FORBIDDEN;
    ErrorResponse errorResponse = new ErrorResponse(status.value(), ex.getMessage());
    return new ResponseEntity<>(errorResponse, status);
  }

  @ExceptionHandler(ResourceConflictException.class)
  public ResponseEntity<ErrorResponse> handleResourceConflictException(
      ResourceConflictException ex) {
    HttpStatus status = HttpStatus.CONFLICT;
    ErrorResponse errorResponse = new ErrorResponse(status.value(), ex.getMessage());
    return new ResponseEntity<>(errorResponse, status);
  }

  @ExceptionHandler(TokenDecodeException.class)
  public ResponseEntity<ErrorResponse> handleTokenDecodeException(TokenDecodeException ex) {
    HttpStatus status = HttpStatus.UNAUTHORIZED;
    ErrorResponse errorResponse = new ErrorResponse(status.value(), ex.getMessage());
    return new ResponseEntity<>(errorResponse, status);
  }

  @ExceptionHandler(RevokedJwtException.class)
  public ResponseEntity<ErrorResponse> handleRevokedJwtException(RevokedJwtException ex) {
    HttpStatus status = HttpStatus.UNAUTHORIZED;
    ErrorResponse errorResponse = new ErrorResponse(status.value(), ex.getMessage());
    return new ResponseEntity<>(errorResponse, status);
  }

  @ExceptionHandler(RuntimeException.class)
  public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException ex) {
    HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
    ErrorResponse errorResponse = new ErrorResponse(status.value(), ex.getMessage());
    String dbMessage = ex.getMessage();
    if (dbMessage != null && dbMessage.contains("Detail: ")) {
      String detail =
          dbMessage.substring(dbMessage.indexOf("Detail: ") + 8, dbMessage.indexOf("]")).trim();
      errorResponse = new ErrorResponse(status.value(), detail);
    }
    return new ResponseEntity<>(errorResponse, status);
  }

  @ExceptionHandler(ConstraintViolationException.class)
  public ResponseEntity<ErrorResponse> handleConstraintViolationException(
      ConstraintViolationException ex) {
    HttpStatus status = HttpStatus.BAD_REQUEST;
    ErrorResponse errorResponse = new ErrorResponse(status.value(), ex.getMessage());
    return new ResponseEntity<>(errorResponse, status);
  }

  @ExceptionHandler(DataAccessException.class)
  public ResponseEntity<ErrorResponse> handleDataAccessException(DataAccessException ex) {
    HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
    ErrorResponse errorResponse = new ErrorResponse(status.value(), ex.getMessage());
    return new ResponseEntity<>(errorResponse, status);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String, String>> handleValidationExceptions(
      MethodArgumentNotValidException ex) {
    Map<String, String> errors = new HashMap<>();
    ex.getBindingResult()
        .getAllErrors()
        .forEach(
            (error) -> {
              String fieldName = ((FieldError) error).getField();
              String errorMessage = error.getDefaultMessage();
              errors.put(fieldName, errorMessage);
            });
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
  }

  @ExceptionHandler(ValidationException.class)
  public ResponseEntity<ErrorResponse> handleValidationException(ValidationException ex) {
    HttpStatus status = HttpStatus.BAD_REQUEST;
    ErrorResponse errorResponse = new ErrorResponse(status.value(), ex.getMessage());
    return new ResponseEntity<>(errorResponse, status);
  }
}
