package com.ems.user.service.impl;

import com.ems.common.enums.UserStatus;
import com.ems.user.entity.User;
import com.ems.user.repository.UserRepository;
import com.ems.user.service.CustomUserDetailsService;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsServiceImpl implements CustomUserDetailsService {

  private final UserRepository userRepository;

  public CustomUserDetailsServiceImpl(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @Override
  public UserDetails loadUserByUsername(String email)
      throws UsernameNotFoundException {

    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new UsernameNotFoundException(
            "User not found with email: " + email));

    return org.springframework.security.core.userdetails.User
        .withUsername(user.getEmail())
        .password(user.getPassword())
        .roles(user.getRole().name())
        .disabled(user.getAccountStatus() != UserStatus.ACTIVE)
        .build();
  }
}