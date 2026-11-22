package com.ems.company.dto;

public class CompanyAdminResponse {
  private Long id;
  private Long companyId;
  private String name;
  private String email;
  private String phone;
  private String department;
  private String joined;
  private String status;
  private Boolean emailVerified;
  private String createdAt;
  private String updatedAt;

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
  public String getDepartment() { return department; }
  public void setDepartment(String department) { this.department = department; }
  public String getJoined() { return joined; }
  public void setJoined(String joined) { this.joined = joined; }
  public String getStatus() { return status; }
  public void setStatus(String status) { this.status = status; }
  public Boolean getEmailVerified() { return emailVerified; }
  public void setEmailVerified(Boolean emailVerified) { this.emailVerified = emailVerified; }
  public String getCreatedAt() { return createdAt; }
  public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
  public String getUpdatedAt() { return updatedAt; }
  public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
