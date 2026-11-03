
package com.ems.auth.service;

import com.ems.auth.dto.LoginRequest;
import com.ems.auth.dto.LoginResponse;
import com.ems.auth.dto.CurrentUserResponse;
import com.ems.auth.dto.ChangePasswordRequest;

public interface AuthService {

  // Login user
  LoginResponse login(LoginRequest request);

  // Get currently logged-in user
  CurrentUserResponse getCurrentUser();

  // Change currently logged-in user's password
  void changePassword(ChangePasswordRequest request);
}
