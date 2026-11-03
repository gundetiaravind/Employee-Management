
package com.ems.auth.controller;

import com.ems.auth.dto.LoginRequest;
import com.ems.auth.dto.LoginResponse;
import com.ems.auth.dto.CurrentUserResponse;
import com.ems.auth.dto.ChangePasswordRequest;
import com.ems.auth.service.AuthService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  // Login API
  @PostMapping("/login")
  public ResponseEntity<LoginResponse> login(
      @Valid @RequestBody LoginRequest request) {

    LoginResponse response = authService.login(request);

    return ResponseEntity
        .status(HttpStatus.OK)
        .body(response);
  }

  // Get currently logged-in user API
  @GetMapping("/me")
  public ResponseEntity<CurrentUserResponse> getCurrentUser() {

    CurrentUserResponse response = authService.getCurrentUser();

    return ResponseEntity
        .status(HttpStatus.OK)
        .body(response);
  }

  // Change password API
  @PutMapping("/change-password")
  public ResponseEntity<Map<String, String>> changePassword(
      @Valid @RequestBody ChangePasswordRequest request) {

    authService.changePassword(request);

    return ResponseEntity.ok(
        Map.of("message", "Password changed successfully"));
  }
}
