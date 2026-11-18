
package com.ems.auth.service.impl;

import com.ems.auth.dto.LoginRequest;
import com.ems.auth.dto.LoginResponse;
import com.ems.auth.dto.CurrentUserResponse;
import com.ems.auth.dto.ChangePasswordRequest;
import com.ems.auth.dto.ForgotPasswordRequest;
import com.ems.auth.dto.PasswordVerifyOtpRequest;
import com.ems.auth.dto.ResetPasswordRequest;
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

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Base64;
import java.util.HexFormat;

import java.security.SecureRandom;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import java.nio.charset.StandardCharsets;

import com.ems.notification.service.EmailService;

@Service
public class AuthServiceImpl implements AuthService {

        private static final int RESEND_COOLDOWN_SECONDS = 60;
private static final int OTP_EXPIRY_MINUTES = 5;
private static final int MAX_OTP_ATTEMPTS = 5;
private static final int RESET_TOKEN_EXPIRY_MINUTES = 5;

private static final SecureRandom RANDOM = new SecureRandom();

    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public AuthServiceImpl(
            AuthenticationManager authenticationManager,
            CustomUserDetailsService userDetailsService,
            UserRepository userRepository,
            JwtService jwtService,
            PasswordEncoder passwordEncoder,
        EmailService emailService) {

        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @Override
    public LoginResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtService.generateToken(userDetails);

        // Company ID is available for users linked to a company.
        Long companyId = user.getCompany() != null
                ? user.getCompany().getId()
                : null;

        return LoginResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .companyId(companyId)
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    @Override
    public CurrentUserResponse getCurrentUser() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return CurrentUserResponse.builder()
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordRequest request) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                user.getPassword())) {

            throw new IllegalArgumentException(
                    "Current password is incorrect");
        }

        if (!request.getNewPassword()
                .equals(request.getConfirmPassword())) {

            throw new IllegalArgumentException(
                    "New password and confirm password do not match");
        }

        if (passwordEncoder.matches(
                request.getNewPassword(),
                user.getPassword())) {

            throw new IllegalArgumentException(
                    "New password must be different from current password");
        }

        user.setPassword(
                passwordEncoder.encode(request.getNewPassword()));

        userRepository.save(user);
    }


    // FORGOT PASSWORD - SEND OTP
    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {

        String email = normalizeEmail(request.getEmail());

        User user = userRepository.findByEmail(email).orElse(null);

        // Do not reveal whether the email is registered.
        if (user == null) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();

        LocalDateTime lastRequested =
                user.getPasswordResetOtpCreatedAt();

        if (lastRequested != null
                && lastRequested.isAfter(
                        now.minusSeconds(RESEND_COOLDOWN_SECONDS))) {

            throw new IllegalArgumentException(
                    "Please wait before requesting another OTP.");
        }

        String otp = String.format(
                Locale.ROOT,
                "%06d",
                RANDOM.nextInt(1_000_000)
        );


                user.setPasswordResetOtpHash(passwordEncoder.encode(otp));
                user.setPasswordResetOtpExpiry(
                LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES)
        );
        user.setPasswordResetOtpAttempts(0);
        user.setPasswordResetOtpCreatedAt(LocalDateTime.now());
        user.setPasswordResetVerified(false);

        user.setPasswordResetTokenHash(null);
        user.setPasswordResetTokenExpiry(null);

        // Important: persist changes
        userRepository.save(user);

        emailService.sendSimpleEmail(
                user.getEmail(),
                "OrgConnect - Password Reset OTP",
                "Hello " + user.getFullName() + ",\n\n"
                        + "Your OrgConnect password reset OTP is: "
                        + otp + "\n\n"
                        + "This OTP expires in 5 minutes.\n"
                        + "You have a maximum of 5 verification attempts.\n\n"
                        + "If you did not request this, please ignore this email.\n\n"
                        + "Regards,\nOrgConnect Team"
        );
    }




        // VERIFY OTP AND GENERATE RESET TOKEN
        @Override
        @Transactional(noRollbackFor = IllegalArgumentException.class)
        public String passwordVerifyOtp(PasswordVerifyOtpRequest request) {

                String email = normalizeEmail(request.email());

                User user = userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                            "Invalid or expired OTP."));

                LocalDateTime now = LocalDateTime.now();

                if (Boolean.TRUE.equals(user.getPasswordResetVerified())
                || user.getPasswordResetOtpHash() == null
                || user.getPasswordResetOtpExpiry() == null
                || !user.getPasswordResetOtpExpiry().isAfter(now)) {

                throw new IllegalArgumentException(
                "Invalid or expired OTP.");
        }

        int attempts = user.getPasswordResetOtpAttempts() == null
                ? 0
                : user.getPasswordResetOtpAttempts();

        if (attempts >= MAX_OTP_ATTEMPTS) {
                throw new IllegalArgumentException(
                        "Maximum OTP attempts exceeded. Request a new OTP.");
        }

        // Increment attempts before checking the OTP.
        user.setPasswordResetOtpAttempts(attempts + 1);

        if (!passwordEncoder.matches(
                request.otp().trim(),
                user.getPasswordResetOtpHash())) {

                userRepository.save(user);

                throw new IllegalArgumentException(
                        "Invalid OTP. Please try again.");
        }

        // Generate a secure reset token.
        String resetToken = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(randomBytes(32));



                user.setPasswordResetVerified(true);
                user.setPasswordResetTokenHash(sha256(resetToken));
                user.setPasswordResetTokenExpiry(
                LocalDateTime.now().plusMinutes(RESET_TOKEN_EXPIRY_MINUTES)
                );

                userRepository.save(user);

        return resetToken;
    }

     // RESET PASSWORD
     @Override
     @Transactional
     public void resetPassword(ResetPasswordRequest request) {

        String email = normalizeEmail(request.getEmail());

        User user = userRepository.findByEmail(email)
            .orElseThrow(() ->
                    new IllegalArgumentException(
                            "Invalid password reset request."));

        // Check whether OTP verification and reset authorization are valid.
        if (!Boolean.TRUE.equals(user.getPasswordResetVerified())
            || user.getPasswordResetTokenHash() == null
            || user.getPasswordResetTokenExpiry() == null
            || !user.getPasswordResetTokenExpiry()
                    .isAfter(LocalDateTime.now())) {

        throw new IllegalArgumentException(
                "Reset authorization is invalid or expired.");
    }

    // Verify the reset token.
    String submittedHash = sha256(request.getResetToken());

    boolean matches = MessageDigest.isEqual(
            submittedHash.getBytes(StandardCharsets.UTF_8),
            user.getPasswordResetTokenHash()
                    .getBytes(StandardCharsets.UTF_8)
    );

    if (!matches) {
        throw new IllegalArgumentException(
                "Invalid password reset request.");
    }

    // Prevent using the current password again.
    if (passwordEncoder.matches(
            request.getNewPassword(),
            user.getPassword())) {

        throw new IllegalArgumentException(
                "New password must be different from current password.");
    }

    // 1. Update the user's password.
    user.setPassword(
            passwordEncoder.encode(request.getNewPassword()));

    // 2. Clear only password-reset-related fields.
    clearPasswordResetData(user);

    // 3. Save the updated user.
    userRepository.save(user);
}

    // CLEAR RESET DATA
    private void clearPasswordResetData(User user) {

        user.setPasswordResetOtpHash(null);
        user.setPasswordResetOtpExpiry(null);
        user.setPasswordResetOtpAttempts(null);
        user.setPasswordResetOtpCreatedAt(null);
        user.setPasswordResetVerified(false);
        user.setPasswordResetTokenHash(null);
        user.setPasswordResetTokenExpiry(null);
    }

    // GENERATE RANDOM BYTES
    private byte[] randomBytes(int length) {

        byte[] bytes = new byte[length];
        RANDOM.nextBytes(bytes);

        return bytes;
    }

    // SHA-256 HASH
    private String sha256(String value) {

        try {
            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            return HexFormat.of().formatHex(
                    digest.digest(
                            value.getBytes(StandardCharsets.UTF_8)
                    )
            );

        } catch (NoSuchAlgorithmException exception) {

            throw new IllegalStateException(
                    "Unable to process reset token.",
                    exception
            );
        }
    }

    // NORMALIZE EMAIL
    private String normalizeEmail(String email) {

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required.");
        }

        return email.trim().toLowerCase(Locale.ROOT);
    }


}
