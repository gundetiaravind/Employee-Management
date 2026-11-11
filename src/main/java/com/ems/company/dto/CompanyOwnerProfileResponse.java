package com.ems.company.dto;

public class CompanyOwnerProfileResponse {
  private Long id;
  private Long companyId;
  private String name;
  private String email;
  private String phone;
  private String role;
  private String accountStatus;
  private Boolean emailVerified;
  private String createdAt;

  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }
  public Long getCompanyId() { return companyId; }
  public void setCompanyId(Long companyId) { this.companyId = companyId; }
  public String getName() { return name; }
  public void setName(String name) { this.name = name; }
  public String getEmail() { return email; }
  public void setEmail(String email) { this.email = email; }
  public String getPhone() { return phone; }
  public void setPhone(String phone) { this.phone = phone; }
  public String getRole() { return role; }
  public void setRole(String role) { this.role = role; }
  public String getAccountStatus() { return accountStatus; }
  public void setAccountStatus(String accountStatus) { this.accountStatus = accountStatus; }
  public Boolean getEmailVerified() { return emailVerified; }
  public void setEmailVerified(Boolean emailVerified) { this.emailVerified = emailVerified; }
  public String getCreatedAt() { return createdAt; }
  public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
