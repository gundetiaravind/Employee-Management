package com.ems.company.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Mandatory 3 fields: code, name, email */
public class CompanyCreateEmployeeRequest {

  @NotBlank(message = "Employment code is required")
  @Size(max = 20)
  private String code;

  @NotBlank(message = "Employee name is required")
  @Size(max = 150)
  private String name;

  @NotBlank(message = "Email is required")
  @Email
  private String email;

  @Size(max = 15)
  private String phone;

  @Size(max = 100)
  private String department;

  @Size(max = 100)
  private String designation;

  @Size(max = 150)
  private String manager;

  private String joined;
  private String status;

  public String getCode() { return code; }
  public void setCode(String code) { this.code = code; }
  public String getName() { return name; }
  public void setName(String name) { this.name = name; }
  public String getEmail() { return email; }
  public void setEmail(String email) { this.email = email; }
  public String getPhone() { return phone; }
  public void setPhone(String phone) { this.phone = phone; }
  public String getDepartment() { return department; }
  public void setDepartment(String department) { this.department = department; }
  public String getDesignation() { return designation; }
  public void setDesignation(String designation) { this.designation = designation; }
  public String getManager() { return manager; }
  public void setManager(String manager) { this.manager = manager; }
  public String getJoined() { return joined; }
  public void setJoined(String joined) { this.joined = joined; }
  public String getStatus() { return status; }
  public void setStatus(String status) { this.status = status; }
}
