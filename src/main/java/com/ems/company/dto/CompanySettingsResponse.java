package com.ems.company.dto;

public class CompanySettingsResponse {
  private Long id;
  private String companyName;
  private String companyEmail;
  private String contactNumber;
  private String address;
  private String website;
  private String city;
  private String state;
  private String country;
  private String pinCode;
  private String industry;
  private String companyType;
  private String registrationStatus;
  private Boolean isActive;

  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }
  public String getCompanyName() { return companyName; }
  public void setCompanyName(String companyName) { this.companyName = companyName; }
  public String getCompanyEmail() { return companyEmail; }
  public void setCompanyEmail(String companyEmail) { this.companyEmail = companyEmail; }
  public String getContactNumber() { return contactNumber; }
  public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }
  public String getAddress() { return address; }
  public void setAddress(String address) { this.address = address; }
  public String getWebsite() { return website; }
  public void setWebsite(String website) { this.website = website; }
  public String getCity() { return city; }
  public void setCity(String city) { this.city = city; }
  public String getState() { return state; }
  public void setState(String state) { this.state = state; }
  public String getCountry() { return country; }
  public void setCountry(String country) { this.country = country; }
  public String getPinCode() { return pinCode; }
  public void setPinCode(String pinCode) { this.pinCode = pinCode; }
  public String getIndustry() { return industry; }
  public void setIndustry(String industry) { this.industry = industry; }
  public String getCompanyType() { return companyType; }
  public void setCompanyType(String companyType) { this.companyType = companyType; }
  public String getRegistrationStatus() { return registrationStatus; }
  public void setRegistrationStatus(String registrationStatus) { this.registrationStatus = registrationStatus; }
  public Boolean getIsActive() { return isActive; }
  public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
