package com.ems.company.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Matches the real companies table used by platform-manager + company-owner flows.
 */
@Entity
@Table(name = "companies")
public class Company {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "company_name", nullable = false, length = 150)
  private String companyName;

  @Column(name = "company_email", nullable = false, unique = true, length = 150)
  private String companyEmail;

  @Column(name = "company_code", length = 50)
  private String companyCode;

  @Column(name = "registration_number", length = 100)
  private String registrationNumber;

  @Column(name = "company_type", length = 100)
  private String companyType;

  @Column(name = "industry", length = 100)
  private String industry;

  @Column(name = "company_phone", length = 20)
  private String companyPhone;

  @Column(name = "alternate_phone", length = 20)
  private String alternatePhone;

  @Column(name = "company_website", length = 255)
  private String companyWebsite;

  @Column(name = "country", length = 100)
  private String country;

  @Column(name = "state", length = 100)
  private String state;

  @Column(name = "city", length = 100)
  private String city;

  @Column(name = "pin_code", length = 20)
  private String pinCode;

  @Column(name = "company_address", columnDefinition = "TEXT")
  private String companyAddress;

  @Column(name = "logo_path", length = 500)
  private String logoPath;

  /** PENDING_VERIFICATION | PENDING_APPROVAL | APPROVED | REJECTED | SUSPENDED */
  @Column(name = "company_status", nullable = false, length = 40)
  private String companyStatus;

  @Column(name = "is_active")
  private Boolean isActive;

  @Column(name = "rejection_reason", columnDefinition = "TEXT")
  private String rejectionReason;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
    if (companyStatus == null || companyStatus.isBlank()) {
      companyStatus = "PENDING_VERIFICATION";
    }
    if (isActive == null) {
      isActive = false;
    }
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }

  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }
  public String getCompanyName() { return companyName; }
  public void setCompanyName(String companyName) { this.companyName = companyName; }
  public String getCompanyEmail() { return companyEmail; }
  public void setCompanyEmail(String companyEmail) { this.companyEmail = companyEmail; }
  public String getCompanyCode() { return companyCode; }
  public void setCompanyCode(String companyCode) { this.companyCode = companyCode; }
  public String getRegistrationNumber() { return registrationNumber; }
  public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }
  public String getCompanyType() { return companyType; }
  public void setCompanyType(String companyType) { this.companyType = companyType; }
  public String getIndustry() { return industry; }
  public void setIndustry(String industry) { this.industry = industry; }
  public String getCompanyPhone() { return companyPhone; }
  public void setCompanyPhone(String companyPhone) { this.companyPhone = companyPhone; }
  public String getAlternatePhone() { return alternatePhone; }
  public void setAlternatePhone(String alternatePhone) { this.alternatePhone = alternatePhone; }
  public String getCompanyWebsite() { return companyWebsite; }
  public void setCompanyWebsite(String companyWebsite) { this.companyWebsite = companyWebsite; }
  public String getCountry() { return country; }
  public void setCountry(String country) { this.country = country; }
  public String getState() { return state; }
  public void setState(String state) { this.state = state; }
  public String getCity() { return city; }
  public void setCity(String city) { this.city = city; }
  public String getPinCode() { return pinCode; }
  public void setPinCode(String pinCode) { this.pinCode = pinCode; }
  public String getCompanyAddress() { return companyAddress; }
  public void setCompanyAddress(String companyAddress) { this.companyAddress = companyAddress; }
  public String getLogoPath() { return logoPath; }
  public void setLogoPath(String logoPath) { this.logoPath = logoPath; }
  public String getCompanyStatus() { return companyStatus; }
  public void setCompanyStatus(String companyStatus) { this.companyStatus = companyStatus; }
  public Boolean getIsActive() { return isActive; }
  public void setIsActive(Boolean isActive) { this.isActive = isActive; }
  public String getRejectionReason() { return rejectionReason; }
  public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
  public LocalDateTime getCreatedAt() { return createdAt; }
  public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
  public LocalDateTime getUpdatedAt() { return updatedAt; }
  public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
