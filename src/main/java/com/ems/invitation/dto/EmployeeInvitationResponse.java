
package com.ems.invitation.dto;

import com.ems.common.enums.Role;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeInvitationResponse {

  private Long id;

  private Long companyId;

  // Role assigned through this invitation
  private Role invitedRole;

  private String employmentCode;

  private String employeeName;

  private String email;

  private String phone;

  private String department;

  private String designation;

  private String managerName;

  private LocalDate dateOfJoining;

  private String invitationStatus;

  // Invitation timestamps
  private LocalDateTime expiresAt;

  private LocalDateTime createdAt;

  private String message;
}
