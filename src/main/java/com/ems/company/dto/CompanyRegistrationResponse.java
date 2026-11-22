
package com.ems.company.dto;

public class CompanyRegistrationResponse {

  private Long companyId;
  private String companyName;
  private String ownerName;
  private String ownerEmail;
  private String ownerMobileNumber;
  private String logoPath;
  private String companyStatus;
  private String message;

  public CompanyRegistrationResponse() {
  }

  public Long getCompanyId() {
    return companyId;
  }

  public void setCompanyId(Long companyId) {
    this.companyId = companyId;
  }

  public String getCompanyName() {
    return companyName;
  }

  public void setCompanyName(String companyName) {
    this.companyName = companyName;
  }

  public String getOwnerName() {
    return ownerName;
  }

  public void setOwnerName(String ownerName) {
    this.ownerName = ownerName;
  }

  public String getOwnerEmail() {
    return ownerEmail;
  }

  public void setOwnerEmail(String ownerEmail) {
    this.ownerEmail = ownerEmail;
  }

  public String getOwnerMobileNumber() {
    return ownerMobileNumber;
  }

  public void setOwnerMobileNumber(String ownerMobileNumber) {
    this.ownerMobileNumber = ownerMobileNumber;
  }

  public String getLogoPath() {
    return logoPath;
  }

  public void setLogoPath(String logoPath) {
    this.logoPath = logoPath;
  }

  public String getCompanyStatus() {
    return companyStatus;
  }

  public void setCompanyStatus(String companyStatus) {
    this.companyStatus = companyStatus;
  }

  public String getMessage() {
    return message;
  }

  public void setMessage(String message) {
    this.message = message;
  }
}
