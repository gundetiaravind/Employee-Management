
package com.ems.security.handler;

import tools.jackson.databind.ObjectMapper;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

@Component
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    public CustomAuthenticationEntryPoint(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException)
            throws IOException, ServletException {

        // Temporary diagnostic logs
        System.out.println("\n========== SECURITY 401 ==========");
        System.out.println("Request URI    : " + request.getRequestURI());
        System.out.println("Request Method : " + request.getMethod());
        System.out.println("Request Origin : " + request.getHeader("Origin"));
        System.out.println("Authorization  : "
                + (request.getHeader("Authorization") == null
                ? "Not provided"
                : "Bearer token provided"));
        System.out.println("Exception      : " + authException.getMessage());
        System.out.println("==================================\n");

        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        Map<String, Object> errorResponse = Map.of(
                "status", 401,
                "error", "Unauthorized",
                "message", "Authentication required or token is invalid",
                "path", request.getRequestURI()
        );

        objectMapper.writeValue(response.getOutputStream(), errorResponse);
    }
}
