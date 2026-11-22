package com.ems.user.service.impl;

import com.ems.common.enums.Role;
import com.ems.common.enums.UserStatus;
import com.ems.company.entity.Company;
import com.ems.user.entity.User;
import com.ems.user.repository.UserRepository;
import com.ems.user.service.UserAccountService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserAccountServiceImpl implements UserAccountService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public User createUserAccount(
            String fullName,
            String email,
            String password,
            String mobileNumber,
            Role role,
            UserStatus accountStatus,
            boolean emailVerified,
            Company company
    ) {

        // Validate required fields
        if (fullName == null || fullName.isBlank()) {
            throw new IllegalArgumentException("Full name is required");
        }

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }

        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }

        if (role == null) {
            throw new IllegalArgumentException("User role is required");
        }

        if (accountStatus == null) {
            throw new IllegalArgumentException("Account status is required");
        }

        // Normalize email
        String normalizedEmail = email.trim().toLowerCase();

        // Check duplicate email
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException(
                    "An account with this email already exists"
            );
        }

        // Validate company association
        if (role != Role.PLATFORM_MANAGER && company == null) {
            throw new IllegalArgumentException(
                    "Company association is required for this role"
            );
        }

        // Create user account
        User user = User.builder()
                .fullName(fullName.trim())
                .email(normalizedEmail)
                .password(passwordEncoder.encode(password))
                .mobileNumber(mobileNumber)
                .role(role)
                .accountStatus(accountStatus)
                .emailVerified(emailVerified)
                .company(company)
                .build();

        return userRepository.save(user);
    }
}