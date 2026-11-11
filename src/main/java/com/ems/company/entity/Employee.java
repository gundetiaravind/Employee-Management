package com.ems.company.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employees", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"company_id", "employment_code"}),
    @UniqueConstraint(columnNames = {"company_id", "company_email"})
})
public class Employee {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "company_id", nullable = false)
  private Long companyId;

  @Column(name = "employment_code", nullable = false, length = 20)
  private String employmentCode;

  @Column(name = "employee_name", nullable = false, length = 150)
  private String employeeName;

  @Column(name = "company_email", nullable = false, length = 150)
  private String companyEmail;

  @Column(name = "phone", length = 15)
  private String phone;

  @Column(name = "department", length = 100)
  private String department;

  @Column(name = "designation", length = 100)
  private String designation;

  @Column(name = "manager_name", length = 150)
  private String managerName;

  @Column(name = "date_of_joining")
  private LocalDate dateOfJoining;

  @Enumerated(EnumType.STRING)
  @Column(name = "employee_status", nullable = false, length = 20)
  private EmployeeStatus employeeStatus;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
    if (employeeStatus == null) employeeStatus = EmployeeStatus.ACTIVE;
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }

  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }
  public Long getCompanyId() { return companyId; }
  public void setCompanyId(Long companyId) { this.companyId = companyId; }
  public String getEmploymentCode() { return employmentCode; }
  public void setEmploymentCode(String employmentCode) { this.employmentCode = employmentCode; }
  public String getEmployeeName() { return employeeName; }
  public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }
  public String getCompanyEmail() { return companyEmail; }
  public void setCompanyEmail(String companyEmail) { this.companyEmail = companyEmail; }
  public String getPhone() { return phone; }
  public void setPhone(String phone) { this.phone = phone; }
  public String getDepartment() { return department; }
  public void setDepartment(String department) { this.department = department; }
  public String getDesignation() { return designation; }
  public void setDesignation(String designation) { this.designation = designation; }
  public String getManagerName() { return managerName; }
  public void setManagerName(String managerName) { this.managerName = managerName; }
  public LocalDate getDateOfJoining() { return dateOfJoining; }
  public void setDateOfJoining(LocalDate dateOfJoining) { this.dateOfJoining = dateOfJoining; }
  public EmployeeStatus getEmployeeStatus() { return employeeStatus; }
  public void setEmployeeStatus(EmployeeStatus employeeStatus) { this.employeeStatus = employeeStatus; }
  public LocalDateTime getCreatedAt() { return createdAt; }
  public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
  public LocalDateTime getUpdatedAt() { return updatedAt; }
  public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
