
package com.ems;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth

                // Allow project management endpoints
                .requestMatchers("/api/projects/**").permitAll()

                // Allow employee endpoints
                .requestMatchers("/api/employees/**").permitAll()

                // Allow employee-project assignment endpoints
                .requestMatchers("/api/employee-projects/**").permitAll()

                // Allow Spring Boot error handling
                .requestMatchers("/error").permitAll()

                // Require authentication for all other endpoints
                .anyRequest().authenticated()
            );

        return http.build();
    }
}
