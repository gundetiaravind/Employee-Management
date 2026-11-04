
package com.ems.security.config;

import com.ems.security.handler.CustomAccessDeniedHandler;
import com.ems.security.handler.CustomAuthenticationEntryPoint;
import com.ems.security.jwt.JwtAuthenticationFilter;
import com.ems.user.service.CustomUserDetailsService;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

  private final CustomUserDetailsService customUserDetailsService;
  private final PasswordEncoder passwordEncoder;
  private final JwtAuthenticationFilter jwtAuthenticationFilter;
  private final CustomAuthenticationEntryPoint authenticationEntryPoint;
  private final CustomAccessDeniedHandler accessDeniedHandler;

  public SecurityConfig(
      CustomUserDetailsService customUserDetailsService,
      PasswordEncoder passwordEncoder,
      JwtAuthenticationFilter jwtAuthenticationFilter,
      CustomAuthenticationEntryPoint authenticationEntryPoint,
      CustomAccessDeniedHandler accessDeniedHandler) {

    this.customUserDetailsService = customUserDetailsService;
    this.passwordEncoder = passwordEncoder;
    this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    this.authenticationEntryPoint = authenticationEntryPoint;
    this.accessDeniedHandler = accessDeniedHandler;
  }

  @Bean
  public DaoAuthenticationProvider authenticationProvider() {

    DaoAuthenticationProvider provider = new DaoAuthenticationProvider(customUserDetailsService);

    provider.setPasswordEncoder(passwordEncoder);

    return provider;
  }

  @Bean
  public AuthenticationManager authenticationManager(
      AuthenticationConfiguration configuration) throws Exception {

    return configuration.getAuthenticationManager();
  }

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http)
      throws Exception {

    http
        .csrf(csrf -> csrf.disable())

        .authorizeHttpRequests(auth -> auth

            // Public endpoints
            .requestMatchers(
                "/api/auth/register",
                "/api/auth/login",
                "/api/auth/verify-email",
                "/api/auth/forgot-password",
                "/api/auth/reset-password")
            .permitAll()

            .requestMatchers("/actuator/health").permitAll()

            // Platform Manager APIs
            .requestMatchers("/api/platform/**")
            .hasRole("PLATFORM_MANAGER")

            // Company Owner APIs
            .requestMatchers("/api/company-owner/**")
            .hasRole("COMPANY_OWNER")

            // Admin APIs
            .requestMatchers("/api/admin/**")
            .hasRole("ADMIN")

            // Employee APIs
            .requestMatchers("/api/employee/**")
            .hasRole("EMPLOYEE")

            // All remaining APIs require authentication
            .anyRequest().authenticated())

        .sessionManagement(session -> session
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

        .authenticationProvider(authenticationProvider())

        .exceptionHandling(exception -> exception
            .authenticationEntryPoint(authenticationEntryPoint)
            .accessDeniedHandler(accessDeniedHandler))

        .addFilterBefore(
            jwtAuthenticationFilter,
            UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }
}
