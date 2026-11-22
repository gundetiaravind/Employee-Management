
package com.ems.notification.service;

public interface EmailVerificationService {

    void sendOwnerVerificationOtp(Long userId);

    void verifyOwnerEmail(String email, String otp);

    void resendOwnerVerificationOtp(String email);
}
