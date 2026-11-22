
package com.ems.auth.service;

import com.ems.auth.dto.LoginRequest;
import com.ems.auth.dto.LoginResponse;
import com.ems.auth.dto.CurrentUserResponse;
import com.ems.auth.dto.ChangePasswordRequest;
import com.ems.auth.dto.ForgotPasswordRequest;
import com.ems.auth.dto.PasswordVerifyOtpRequest;
import com.ems.auth.dto.ResetPasswordRequest;

public interface AuthService {

  // Login user
  LoginResponse login(LoginRequest request);

  // Get currently logged-in user
  CurrentUserResponse getCurrentUser();

  // Change currently logged-in user's password
  void changePassword(ChangePasswordRequest request);

  void forgotPassword(ForgotPasswordRequest request);

  // Verify password reset OTP
 String passwordVerifyOtp(PasswordVerifyOtpRequest request);

    // Reset password after OTP verification
  void resetPassword(ResetPasswordRequest request);
}

