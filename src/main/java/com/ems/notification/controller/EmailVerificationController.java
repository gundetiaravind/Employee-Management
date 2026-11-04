
package com.ems.notification.controller;

import com.ems.notification.dto.ResendVerificationRequest;
import com.ems.notification.dto.VerifyEmailRequest;
import com.ems.notification.service.EmailVerificationService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class EmailVerificationController {

    private final EmailVerificationService verificationService;

    public EmailVerificationController(
            EmailVerificationService verificationService) {
        this.verificationService = verificationService;
    }

    @PostMapping("/verify-email")
    public ResponseEntity<String> verifyEmail(
            @Valid @RequestBody VerifyEmailRequest request) {

        verificationService.verifyOwnerEmail(
                request.email(),
                request.otp()
        );

        return ResponseEntity.ok(
                "Email verified successfully. Your account is awaiting approval."
        );
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<String> resendVerification(
            @Valid @RequestBody ResendVerificationRequest request) {

        verificationService.resendOwnerVerificationOtp(
                request.email()
        );

        return ResponseEntity.ok(
                "A new verification OTP has been sent to your email."
        );
    }
}
