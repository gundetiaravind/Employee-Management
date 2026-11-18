
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

        // emailService.sendSimpleEmail(
        //         user.getEmail(),
        //         "OrgConnect - Password Reset OTP",
        //         "Hello " + user.getFullName() + ",\n\n"
        //                 + "Your OrgConnect password reset OTP is: "
        //                 + otp + "\n\n"
        //                 + "This OTP expires in 5 minutes.\n"
        //                 + "You have a maximum of 5 verification attempts.\n\n"
        //                 + "If you did not request this, please ignore this email.\n\n"
        //                 + "Regards,\nOrgConnect Team"
        // );

        emailService.sendHtmlEmail(
        user.getEmail(),
        "OrgConnect - Password Reset OTP",
        this.buildPasswordResetOtpEmail(user.getFullName(), otp));
    }
    // BUILD PASSWORD RESET OTP HTML EMAIL
    private String buildPasswordResetOtpEmail(String fullName, String otp) {

        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Password Reset OTP</title>
            </head>

            <body style="
                margin: 0;
                padding: 0;
                background-color: #f4f6f9;
                font-family: Arial, Helvetica, sans-serif;
            ">

                <table width="100%%" cellpadding="0" cellspacing="0"
                       style="padding: 30px 10px; background-color: #f4f6f9;">

                    <tr>
                        <td align="center">

                            <table width="100%%" cellpadding="0" cellspacing="0"
                                   style="
                                       max-width: 600px;
                                       background-color: #ffffff;
                                       border-radius: 10px;
                                       overflow: hidden;
                                       border: 1px solid #e5e7eb;
                                   ">

                                <!-- Header -->
                                <tr>
                                    <td style="
                                        background-color: #2563eb;
                                        padding: 25px;
                                        text-align: center;
                                    ">
                                        <h1 style="
                                            margin: 0;
                                            color: #ffffff;
                                            font-size: 26px;
                                        ">
                                            OrgConnect
                                        </h1>

                                        <p style="
                                            margin: 8px 0 0;
                                            color: #dbeafe;
                                            font-size: 14px;
                                        ">
                                            Employee Management System
                                        </p>
                                    </td>
                                </tr>

                                <!-- Content -->
                                <tr>
                                    <td style="padding: 35px 30px;">

                                        <h2 style="
                                            color: #1f2937;
                                            font-size: 22px;
                                            margin-top: 0;
                                        ">
                                            Password Reset Request
                                        </h2>

                                        <p style="
                                            color: #4b5563;
                                            font-size: 15px;
                                            line-height: 1.6;
                                        ">
                                            Hello <strong>%s</strong>,
                                        </p>

                                        <p style="
                                            color: #4b5563;
                                            font-size: 15px;
                                            line-height: 1.6;
                                        ">
                                            We received a request to reset your
                                            OrgConnect account password.
                                            Use the OTP below to verify your identity.
                                        </p>

                                        <!-- OTP -->
                                        <table width="100%%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td align="center" style="padding: 20px 0;">

                                                    <div style="
                                                        display: inline-block;
                                                        background-color: #eff6ff;
                                                        border: 1px dashed #2563eb;
                                                        border-radius: 8px;
                                                        padding: 18px 35px;
                                                        color: #1d4ed8;
                                                        font-size: 32px;
                                                        font-weight: bold;
                                                        letter-spacing: 10px;
                                                    ">
                                                        %s
                                                    </div>

                                                </td>
                                            </tr>
                                        </table>

                                        <p style="
                                            color: #4b5563;
                                            font-size: 14px;
                                            line-height: 1.6;
                                        ">
                                            <strong>Important:</strong>
                                        </p>

                                        <ul style="
                                            color: #4b5563;
                                            font-size: 14px;
                                            line-height: 1.8;
                                            padding-left: 20px;
                                        ">
                                            <li>This OTP expires in <strong>5 minutes</strong>.</li>
                                            <li>You have a maximum of <strong>5 verification attempts</strong>.</li>
                                            <li>Never share this OTP with anyone.</li>
                                        </ul>

                                        <p style="
                                            color: #4b5563;
                                            font-size: 14px;
                                            line-height: 1.6;
                                        ">
                                            If you did not request a password reset,
                                            please ignore this email. Your account
                                            password will remain unchanged.
                                        </p>

                                        <p style="
                                            color: #4b5563;
                                            font-size: 15px;
                                            line-height: 1.6;
                                            margin-top: 30px;
                                        ">
                                            Regards,<br>
                                            <strong>OrgConnect Team</strong>
                                        </p>

                                    </td>
                                </tr>

                                <!-- Footer -->
                                <tr>
                                    <td style="
                                        background-color: #f9fafb;
                                        padding: 18px;
                                        text-align: center;
                                        border-top: 1px solid #e5e7eb;
                                    ">
                                        <p style="
                                            margin: 0;
                                            color: #9ca3af;
                                            font-size: 12px;
                                        ">
                                            This is an automated email.
                                            Please do not reply.
                                        </p>

                                        <p style="
                                            margin: 8px 0 0;
                                            color: #9ca3af;
                                            font-size: 12px;
                                        ">
                                            &copy; OrgConnect. All rights reserved.
                                        </p>
                                    </td>
                                </tr>

                            </table>

                        </td>
                    </tr>

                </table>

            </body>
            </html>
            """.formatted(
                    escapeHtml(fullName),
                    otp
            );
    }

// ESCAPE HTML SPECIAL CHARACTERS
private String escapeHtml(String value) {

    if (value == null) {
        return "";
    }

    return value
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&#39;");
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
