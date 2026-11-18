
package com.ems.invitation.dto;

import com.ems.common.enums.Role;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class EmployeeInvitationRequest {

  @NotNull(message = "Invitation role is required")
  private Role invitedRole;

  @Size(max = 20, message = "Employment code cannot exceed 20 characters")
  private String employmentCode;

  @NotBlank(message = "Employee name is required")
  @Size(max = 150, message = "Employee name cannot exceed 150 characters")
  private String employeeName;

  @NotBlank(message = "Email is required")
  @Email(message = "Please provide a valid email address")
  @Size(max = 150, message = "Email cannot exceed 150 characters")
  private String email;

  @Size(max = 20, message = "Phone cannot exceed 20 characters")
  private String phone;

  @Size(max = 100, message = "Department cannot exceed 100 characters")
  private String department;

  @Size(max = 100, message = "Designation cannot exceed 100 characters")
  private String designation;

  @Size(max = 150, message = "Manager name cannot exceed 150 characters")
  private String managerName;

  private LocalDate dateOfJoining;
}
