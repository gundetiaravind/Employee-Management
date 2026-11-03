
package com.ems.security.jwt;

import com.ems.user.service.CustomUserDetailsService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private final JwtService jwtService;
  private final CustomUserDetailsService userDetailsService;

  public JwtAuthenticationFilter(
      JwtService jwtService,
      CustomUserDetailsService userDetailsService) {

    this.jwtService = jwtService;
    this.userDetailsService = userDetailsService;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request,
      HttpServletResponse response,
      FilterChain filterChain)
      throws ServletException, IOException {

    final String authorizationHeader = request.getHeader("Authorization");

    final String jwt;
    final String userEmail;

    // Check whether Authorization header contains Bearer token
    if (authorizationHeader == null ||
        !authorizationHeader.startsWith("Bearer ")) {

      filterChain.doFilter(request, response);
      return;
    }

    // Extract JWT token
    jwt = authorizationHeader.substring(7);

    try {

      // Extract email from JWT
      userEmail = jwtService.extractUsername(jwt);

      // Authenticate only if user is not already authenticated
      if (userEmail != null &&
          SecurityContextHolder.getContext().getAuthentication() == null) {

        // Load user details from database
        UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

        // Validate JWT
        if (jwtService.isTokenValid(jwt, userDetails)) {

          UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
              userDetails,
              null,
              userDetails.getAuthorities());

          authenticationToken.setDetails(
              new WebAuthenticationDetailsSource()
                  .buildDetails(request));

          // Set authenticated user in SecurityContext
          SecurityContextHolder.getContext()
              .setAuthentication(authenticationToken);
        }
      }

    } catch (Exception exception) {

      // Clear security context for invalid tokens
      SecurityContextHolder.clearContext();
    }

    // Continue request processing
    filterChain.doFilter(request, response);
  }
}
