
package com.ems.notification.service.impl;

import com.ems.common.enums.Role;
import com.ems.notification.entity.OwnerEmailVerification;
import com.ems.notification.repository.OwnerEmailVerificationRepository;
import com.ems.notification.service.EmailService;
import com.ems.notification.service.EmailVerificationService;
import com.ems.user.entity.User;
import com.ems.user.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Locale;

@Service
public class EmailVerificationServiceImpl
        implements EmailVerificationService {

    private static final int OTP_EXPIRY_MINUTES = 5;

    private final UserRepository userRepository;
    private final OwnerEmailVerificationRepository verificationRepository;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();

    public EmailVerificationServiceImpl(
            UserRepository userRepository,
            OwnerEmailVerificationRepository verificationRepository,
            EmailService emailService) {

        this.userRepository = userRepository;
        this.verificationRepository = verificationRepository;
        this.emailService = emailService;
    }

    @Override
    @Transactional
    public void sendOwnerVerificationOtp(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Owner account not found"
                ));

        if (user.getRole() != Role.COMPANY_OWNER) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email verification is only available for company owners"
            );
        }

        if (user.isEmailVerified()) {
            return;
        }

        String otp = generateOtp();

        OwnerEmailVerification verification =
                verificationRepository.findByUser_Id(user.getId())
                        .orElseGet(() -> OwnerEmailVerification.builder()
                                .user(user)
                                .build());

        verification.setOtpHash(hashOtp(otp));
        verification.setExpiresAt(
                LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES)
        );

        verificationRepository.save(verification);

        emailService.sendSimpleEmail(
                user.getEmail(),
                "OrgConnect - Email Verification",
                "Hello " + user.getFullName() + ",\n\n"
                        + "Your OrgConnect email verification OTP is: "
                        + otp + "\n\n"
                        + "This OTP expires in 5 minutes.\n\n"
                        + "If you did not register for OrgConnect, "
                        + "please ignore this email.\n\n"
                        + "Regards,\nOrgConnect Team"
        );
    }

    @Override
    @Transactional
    public void verifyOwnerEmail(String email, String otp) {

        String normalizedEmail = normalizeEmail(email);

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Owner account not found"
                ));

        if (user.getRole() != Role.COMPANY_OWNER) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid owner account"
            );
        }

        if (user.isEmailVerified()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email is already verified"
            );
        }

        OwnerEmailVerification verification =
                verificationRepository.findByUser_Id(user.getId())
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.BAD_REQUEST,
                                "No verification OTP found. Please request a new OTP."
                        ));

        if (LocalDateTime.now().isAfter(verification.getExpiresAt())) {
            verificationRepository.delete(verification);

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "OTP has expired. Please request a new OTP."
            );
        }

        String submittedHash = hashOtp(otp.trim());

        boolean matches = MessageDigest.isEqual(
                submittedHash.getBytes(StandardCharsets.UTF_8),
                verification.getOtpHash().getBytes(StandardCharsets.UTF_8)
        );

        if (!matches) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid OTP"
            );
        }

        user.setEmailVerified(true);

        // Do not activate the account here.
        // Account status remains PENDING_VERIFICATION.

        userRepository.save(user);
        verificationRepository.delete(verification);
    }

    @Override
    @Transactional
    public void resendOwnerVerificationOtp(String email) {

        String normalizedEmail = normalizeEmail(email);

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Owner account not found"
                ));

        if (user.getRole() != Role.COMPANY_OWNER) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid owner account"
            );
        }

        if (user.isEmailVerified()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email is already verified"
            );
        }

        sendOwnerVerificationOtp(user.getId());
    }

    private String generateOtp() {
        return String.format(
                Locale.ROOT,
                "%06d",
                secureRandom.nextInt(1_000_000)
        );
    }

    private String hashOtp(String otp) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");

            byte[] hash = digest.digest(
                    otp.getBytes(StandardCharsets.UTF_8)
            );

            return HexFormat.of().formatHex(hash);

        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException(
                    "Unable to process verification OTP",
                    exception
            );
        }
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email is required"
            );
        }

        return email.trim().toLowerCase(Locale.ROOT);
    }
}
