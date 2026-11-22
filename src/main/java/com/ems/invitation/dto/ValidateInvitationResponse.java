
package com.ems.invitation.dto;

import com.ems.common.enums.Role;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ValidateInvitationResponse {

  private boolean valid;

  private String message;

  // Role assigned through the invitation
  private Role invitedRole;

  private String employeeName;

  private String email;

  private String companyName;

  private String employmentCode;

  private String department;

  private String designation;

  private LocalDateTime expiresAt;
}
