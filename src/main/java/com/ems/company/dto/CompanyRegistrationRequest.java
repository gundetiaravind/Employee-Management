package com.ems.company.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CompanyRegistrationRequest {

  @NotBlank @Size(max = 150)
  private String companyName;

  @NotBlank @Email
  private String companyEmail;

  @NotBlank
  private String companyPhone;

  @NotBlank
  private String companyAddress;

  @NotBlank @Size(max = 100)
  private String ownerName;

  @NotBlank @Email
  private String ownerEmail;

  @NotBlank @Size(min = 8, max = 72)
  private String password;

  public String getCompanyName() { return companyName; }
  public void setCompanyName(String companyName) { this.companyName = companyName; }
  public String getCompanyEmail() { return companyEmail; }
  public void setCompanyEmail(String companyEmail) { this.companyEmail = companyEmail; }
  public String getCompanyPhone() { return companyPhone; }
  public void setCompanyPhone(String companyPhone) { this.companyPhone = companyPhone; }
  public String getCompanyAddress() { return companyAddress; }
  public void setCompanyAddress(String companyAddress) { this.companyAddress = companyAddress; }
  public String getOwnerName() { return ownerName; }
  public void setOwnerName(String ownerName) { this.ownerName = ownerName; }
  public String getOwnerEmail() { return ownerEmail; }
  public void setOwnerEmail(String ownerEmail) { this.ownerEmail = ownerEmail; }
  public String getPassword() { return password; }
  public void setPassword(String password) { this.password = password; }
}
