package com.ems.company.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Clean JSON errors for company-owner APIs (no long stack traces in body preference).
 */
@RestControllerAdvice(basePackages = "com.ems.company")
public class CompanyApiExceptionHandler {

  @ExceptionHandler(ResponseStatusException.class)
  public ResponseEntity<Map<String, Object>> handleStatus(ResponseStatusException ex) {
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("timestamp", Instant.now().toString());
    body.put("status", ex.getStatusCode().value());
    body.put("error", HttpStatus.valueOf(ex.getStatusCode().value()).getReasonPhrase());
    body.put("message", ex.getReason() != null ? ex.getReason() : ex.getMessage());
    return ResponseEntity.status(ex.getStatusCode()).body(body);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
    String details = ex.getBindingResult().getFieldErrors().stream()
        .map(FieldError::getDefaultMessage)
        .collect(Collectors.joining("; "));
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("timestamp", Instant.now().toString());
    body.put("status", 400);
    body.put("error", "Bad Request");
    body.put("message", details.isBlank() ? "Validation failed" : details);
    return ResponseEntity.badRequest().body(body);
  }

  @ExceptionHandler(RuntimeException.class)
  public ResponseEntity<Map<String, Object>> handleRuntime(RuntimeException ex) {
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("timestamp", Instant.now().toString());
    body.put("status", 400);
    body.put("error", "Bad Request");
    body.put("message", ex.getMessage() != null ? ex.getMessage() : "Request failed");
    return ResponseEntity.badRequest().body(body);
  }
}
