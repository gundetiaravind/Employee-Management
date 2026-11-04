
package com.ems.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class LoginResponse {

  private String accessToken;

  private String tokenType;

  private Long userId;

  private String fullName;

  private String email;

  private String role;
}
