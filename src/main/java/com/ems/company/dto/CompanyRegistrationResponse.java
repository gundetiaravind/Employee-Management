package com.ems.company.dto;

public class CompanyRegistrationResponse {

  private Long companyId;
  private String companyName;
  private String ownerEmail;
  private String companyStatus;
  private String message;

  public Long getCompanyId() { return companyId; }
  public void setCompanyId(Long companyId) { this.companyId = companyId; }
  public String getCompanyName() { return companyName; }
  public void setCompanyName(String companyName) { this.companyName = companyName; }
  public String getOwnerEmail() { return ownerEmail; }
  public void setOwnerEmail(String ownerEmail) { this.ownerEmail = ownerEmail; }
  public String getCompanyStatus() { return companyStatus; }
  public void setCompanyStatus(String companyStatus) { this.companyStatus = companyStatus; }
  public String getMessage() { return message; }
  public void setMessage(String message) { this.message = message; }
}
