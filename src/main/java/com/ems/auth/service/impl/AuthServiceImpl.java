
package com.ems.auth.service.impl;

import com.ems.auth.dto.LoginRequest;
import com.ems.auth.dto.LoginResponse;
import com.ems.auth.dto.CurrentUserResponse;
import com.ems.auth.dto.ChangePasswordRequest;
import com.ems.auth.service.AuthService;

import com.ems.security.jwt.JwtService;

import com.ems.user.entity.User;
import com.ems.user.repository.UserRepository;
import com.ems.user.service.CustomUserDetailsService;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {

  private final AuthenticationManager authenticationManager;
  private final CustomUserDetailsService userDetailsService;
  private final UserRepository userRepository;
  private final JwtService jwtService;
  private final PasswordEncoder passwordEncoder;

  public AuthServiceImpl(
      AuthenticationManager authenticationManager,
      CustomUserDetailsService userDetailsService,
      UserRepository userRepository,
      JwtService jwtService,
      PasswordEncoder passwordEncoder) {

    this.authenticationManager = authenticationManager;
    this.userDetailsService = userDetailsService;
    this.userRepository = userRepository;
    this.jwtService = jwtService;
    this.passwordEncoder = passwordEncoder;
  }

  // Login user
  @Override
  public LoginResponse login(LoginRequest request) {

    // Authenticate email and password
    authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(
            request.getEmail(),
            request.getPassword()));

    // Load authenticated user's security details
    UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());

    // Fetch user information from database
    User user = userRepository.findByEmail(request.getEmail())
        .orElseThrow(() -> new RuntimeException("User not found"));

    // Generate JWT token
    String token = jwtService.generateToken(userDetails);

    // Return login response
    return LoginResponse.builder()
        .accessToken(token)
        .tokenType("Bearer")
        .userId(user.getId())
        .fullName(user.getFullName())
        .email(user.getEmail())
        .role(user.getRole().name())
        .build();
  }

  // Get currently logged-in user
  @Override
  public CurrentUserResponse getCurrentUser() {

    // Get authentication information from Spring Security
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    // Get currently authenticated user's email
    String email = authentication.getName();

    // Fetch user from database
    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("User not found"));

    // Return current user details
    return CurrentUserResponse.builder()
        .userId(user.getId())
        .fullName(user.getFullName())
        .email(user.getEmail())
        .role(user.getRole().name())
        .build();
  }

  // Change currently logged-in user's password
  @Override
  @Transactional
  public void changePassword(ChangePasswordRequest request) {

    // Get currently authenticated user
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    String email = authentication.getName();

    // Find user in database
    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("User not found"));

    // Verify current password
    if (!passwordEncoder.matches(
        request.getCurrentPassword(),
        user.getPassword())) {

      throw new IllegalArgumentException(
          "Current password is incorrect");
    }

    // Check new password and confirmation
    if (!request.getNewPassword()
        .equals(request.getConfirmPassword())) {

      throw new IllegalArgumentException(
          "New password and confirm password do not match");
    }

    // Prevent reusing the current password
    if (passwordEncoder.matches(
        request.getNewPassword(),
        user.getPassword())) {

      throw new IllegalArgumentException(
          "New password must be different from current password");
    }

    // Encode the new password using BCrypt
    user.setPassword(
        passwordEncoder.encode(request.getNewPassword()));

    // Save updated password
    userRepository.save(user);
  }
}
