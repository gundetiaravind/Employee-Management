package com.ems.company.dto;

import jakarta.validation.constraints.Size;

public class CompanyUpdateSettingsRequest {
  @Size(max = 150) private String companyName;
  @Size(max = 20) private String contactNumber;
  private String address;
  @Size(max = 255) private String website;

  public String getCompanyName() { return companyName; }
  public void setCompanyName(String companyName) { this.companyName = companyName; }
  public String getContactNumber() { return contactNumber; }
  public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }
  public String getAddress() { return address; }
  public void setAddress(String address) { this.address = address; }
  public String getWebsite() { return website; }
  public void setWebsite(String website) { this.website = website; }
}
