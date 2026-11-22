
package com.ems.invitation.util;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;

public final class InvitationTokenUtil {

  private static final SecureRandom SECURE_RANDOM = new SecureRandom();

  private InvitationTokenUtil() {
    // Utility class
  }

  // Generate a cryptographically secure random invitation token
  public static String generateToken() {

    byte[] randomBytes = new byte[32];

    SECURE_RANDOM.nextBytes(randomBytes);

    return Base64.getUrlEncoder()
        .withoutPadding()
        .encodeToString(randomBytes);
  }

  // Convert the raw token into a SHA-256 hash
  public static String hashToken(String token) {

    if (token == null || token.isBlank()) {
      throw new IllegalArgumentException(
          "Invitation token cannot be empty");
    }

    try {
      MessageDigest digest = MessageDigest.getInstance("SHA-256");

      byte[] hashedBytes = digest.digest(
          token.getBytes(java.nio.charset.StandardCharsets.UTF_8));

      return HexFormat.of().formatHex(hashedBytes);

    } catch (NoSuchAlgorithmException exception) {

      throw new IllegalStateException(
          "SHA-256 algorithm is unavailable",
          exception);
    }
  }
}
