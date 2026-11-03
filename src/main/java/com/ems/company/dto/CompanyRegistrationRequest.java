
package com.ems.company.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CompanyRegistrationRequest {

  // Company Details

  @NotBlank(message = "Company name is required")
  @Size(max = 150)
  private String companyName;

  @NotBlank(message = "Company email is required")
  @Email(message = "Enter a valid company email")
  private String companyEmail;

  @NotBlank(message = "Company phone is required")
  private String companyPhone;

  @NotBlank(message = "Company address is required")
  private String companyAddress;

  // Company Owner Details

  @NotBlank(message = "Owner name is required")
  @Size(max = 100)
  private String ownerName;

  @NotBlank(message = "Owner email is required")
  @Email(message = "Enter a valid owner email")
  private String ownerEmail;

  @NotBlank(message = "Password is required")
  @Size(min = 8, max = 72)
  private String password;
}
