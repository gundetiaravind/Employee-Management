
package com.ems.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

  // Handle invalid login credentials
  @ExceptionHandler(BadCredentialsException.class)
  public ResponseEntity<Map<String, Object>> handleBadCredentials(
      BadCredentialsException exception) {

    Map<String, Object> response = new HashMap<>();

    response.put("status", 401);
    response.put("error", "Unauthorized");
    response.put("message", "Invalid email or password");

    return ResponseEntity
        .status(HttpStatus.UNAUTHORIZED)
        .body(response);
  }

  // Handle request validation errors
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String, Object>> handleValidationErrors(
      MethodArgumentNotValidException exception) {

    Map<String, Object> errors = new HashMap<>();

    exception.getBindingResult()
        .getFieldErrors()
        .forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));

    Map<String, Object> response = new HashMap<>();

    response.put("status", 400);
    response.put("error", "Bad Request");
    response.put("messages", errors);

    return ResponseEntity
        .status(HttpStatus.BAD_REQUEST)
        .body(response);
  }
}
