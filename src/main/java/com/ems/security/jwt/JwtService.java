
package com.ems.security.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {

  @Value("${jwt.secret}")
  private String secretKey;

  @Value("${jwt.expiration}")
  private long jwtExpiration;

  // Generate JWT token
  public String generateToken(UserDetails userDetails) {

    return Jwts.builder()
        .subject(userDetails.getUsername())
        .claim("role", userDetails.getAuthorities()
            .stream()
            .findFirst()
            .map(authority -> authority.getAuthority())
            .orElse(""))
        .issuedAt(new Date())
        .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
        .signWith(getSigningKey())
        .compact();
  }

  // Extract username (email) from JWT
  public String extractUsername(String token) {

    return extractClaim(token, Claims::getSubject);
  }

  // Extract a specific claim
  public <T> T extractClaim(
      String token,
      Function<Claims, T> claimsResolver) {

    final Claims claims = extractAllClaims(token);

    return claimsResolver.apply(claims);
  }

  // Extract all claims
  private Claims extractAllClaims(String token) {

    return Jwts.parser()
        .verifyWith(getSigningKey())
        .build()
        .parseSignedClaims(token)
        .getPayload();
  }

  // Generate signing key
  private SecretKey getSigningKey() {

    byte[] keyBytes = Decoders.BASE64.decode(secretKey);

    return Keys.hmacShaKeyFor(keyBytes);
  }

  // Check whether token is expired
  public boolean isTokenExpired(String token) {

    return extractClaim(token, Claims::getExpiration)
        .before(new Date());
  }

  // Validate token
  public boolean isTokenValid(
      String token,
      UserDetails userDetails) {

    final String username = extractUsername(token);

    return username.equals(userDetails.getUsername())
        && !isTokenExpired(token);
  }
}
