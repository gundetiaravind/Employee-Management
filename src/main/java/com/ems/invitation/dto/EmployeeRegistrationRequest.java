
package com.ems.invitation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
public class EmployeeRegistrationRequest {

  // Invitation token received through the email link
  @NotBlank(message = "Invitation token is required")
  private String token;

  // Account password
  @NotBlank(message = "Password is required")
  @Size(min = 8, max = 72, message = "Password must contain between 8 and 72 characters")
  private String password;

  @NotBlank(message = "Confirm password is required")
  private String confirmPassword;

  // Personal information
  @Size(max = 20, message = "Alternate phone cannot exceed 20 characters")
  private String alternatePhone;

  @Size(max = 255, message = "Address cannot exceed 255 characters")
  private String address;

  @Size(max = 50, message = "City cannot exceed 50 characters")
  private String city;

  @Size(max = 50, message = "State cannot exceed 50 characters")
  private String state;

  @Size(max = 10, message = "Postal code cannot exceed 10 characters")
  private String postalCode;

  // Employment information
  @Size(max = 30, message = "Employment type cannot exceed 30 characters")
  private String employmentType;
}
