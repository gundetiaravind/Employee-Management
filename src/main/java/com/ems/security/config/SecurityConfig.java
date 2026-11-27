
package com.ems.security.config;

import java.util.List;

import com.ems.security.handler.CustomAccessDeniedHandler;
import com.ems.security.handler.CustomAuthenticationEntryPoint;
import com.ems.security.jwt.JwtAuthenticationFilter;
import com.ems.user.service.CustomUserDetailsService;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

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

    // ==================== CORS CONFIGURATION ====================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of(
                        "http://localhost:5173",
                        "http://127.0.0.1:5173"));

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"));

        configuration.setAllowedHeaders(
                List.of(
                        "Authorization",
                        "Content-Type",
                        "Accept",
                        "X-Company-Id"));

        configuration.setExposedHeaders(
                List.of("Authorization"));

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    // ==================== AUTHENTICATION PROVIDER ====================

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

    // ==================== SECURITY FILTER CHAIN ====================

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                .csrf(csrf -> csrf.disable())

                .authorizeHttpRequests(auth -> auth

                        // CORS preflight requests
                        .requestMatchers(HttpMethod.OPTIONS, "/**")
                        .permitAll()

                        .requestMatchers("/error")
                        .permitAll()

                        // Public authentication and registration endpoints
                        .requestMatchers(
                                "/api/auth/register",
                                "/api/auth/login",
                                "/api/auth/verify-email",
                                "/api/auth/resend-verification",
                                "/api/auth/forgot-password",
                                "/api/auth/password-verify-otp",
                                "/api/auth/reset-password",
                                "/api/invitations/validate",
                                "/api/invitations/accept",
                                "/actuator/health",
                                "/uploads/**")
                        .permitAll()

                        // Invitation management:
                        // Company Owner and Admin
                        .requestMatchers("/api/invitations/**")
                        .hasAnyRole("COMPANY_OWNER", "ADMIN")

                        // Platform Manager APIs
                        .requestMatchers("/api/platform/**")
                        .hasRole("PLATFORM_MANAGER")

                        // Admin management:
                        // Company Owner only
                        .requestMatchers(
                                "/api/company-owner/admins/**",
                                "/api/company/admins/**")
                        .hasRole("COMPANY_OWNER")

                        // Employee management through company-owner routes:
                        // Company Owner and Admin
                        .requestMatchers("/api/company-owner/employees/**")
                        .hasAnyRole("COMPANY_OWNER", "ADMIN")

                        // Other Company Owner APIs
                        .requestMatchers("/api/company-owner/**")
                        .hasRole("COMPANY_OWNER")

                        // Admin-specific APIs
                        .requestMatchers("/api/admin/**")
                        .hasRole("ADMIN")

                        // Shared company employee APIs:
                        // Company Owner and Admin
                        .requestMatchers("/api/company/employees/**")
                        .hasAnyRole("COMPANY_OWNER", "ADMIN")

                        // Employee self-service APIs
                        .requestMatchers("/api/employees/**")
                        .hasRole("EMPLOYEE")

                        .requestMatchers("/api/attendance/**")
                        .hasRole("EMPLOYEE")

                        // All remaining APIs require authentication
                        .anyRequest()
                        .authenticated())

                // Stateless JWT authentication
                .sessionManagement(session -> session.sessionCreationPolicy(
                        SessionCreationPolicy.STATELESS))

                .authenticationProvider(authenticationProvider())

                // Exception handling
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler))

                // JWT authentication filter
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
