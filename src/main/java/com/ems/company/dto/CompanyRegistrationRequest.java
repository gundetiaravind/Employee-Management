
package com.ems.company.dto;

import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CompanyRegistrationRequest {

  @NotBlank
  @Size(max = 150)
  private String companyName;

  @Email
  private String companyEmail;

  @NotBlank
  private String companyPhone;

  @NotBlank
  private String companyAddress;

  @NotBlank
  @Size(max = 100)
  private String registrationNumber;

  @NotBlank
  private String companyType;

  @NotBlank
  private String industry;

  private String alternatePhone;
  private String companyWebsite;

  @NotBlank
  private String country;

  @NotBlank
  private String state;

  @NotBlank
  private String city;

  @NotBlank
  private String pinCode;

  private MultipartFile companyLogo;

  @NotBlank
  @Size(max = 100)
  private String ownerName;

  @NotBlank
  @Email
  private String ownerEmail;

  @NotBlank
  @Size(min = 8, max = 72)
  private String password;

  @NotBlank
  private String confirmPassword;

  @NotBlank
  private String ownerMobileNumber;

  public String getCompanyName() {
    return companyName;
  }

  public void setCompanyName(String companyName) {
    this.companyName = companyName;
  }

  public String getCompanyEmail() {
    return companyEmail;
  }

  public void setCompanyEmail(String companyEmail) {
    this.companyEmail = companyEmail;
  }

  public String getCompanyPhone() {
    return companyPhone;
  }

  public void setCompanyPhone(String companyPhone) {
    this.companyPhone = companyPhone;
  }

  public String getCompanyAddress() {
    return companyAddress;
  }

  public void setCompanyAddress(String companyAddress) {
    this.companyAddress = companyAddress;
  }

  public String getRegistrationNumber() {
    return registrationNumber;
  }

  public void setRegistrationNumber(String registrationNumber) {
    this.registrationNumber = registrationNumber;
  }

  public String getCompanyType() {
    return companyType;
  }

  public void setCompanyType(String companyType) {
    this.companyType = companyType;
  }

  public String getIndustry() {
    return industry;
  }

  public void setIndustry(String industry) {
    this.industry = industry;
  }

  public String getAlternatePhone() {
    return alternatePhone;
  }

  public void setAlternatePhone(String alternatePhone) {
    this.alternatePhone = alternatePhone;
  }

  public String getCompanyWebsite() {
    return companyWebsite;
  }

  public void setCompanyWebsite(String companyWebsite) {
    this.companyWebsite = companyWebsite;
  }

  public String getCountry() {
    return country;
  }

  public void setCountry(String country) {
    this.country = country;
  }

  public String getState() {
    return state;
  }

  public void setState(String state) {
    this.state = state;
  }

  public String getCity() {
    return city;
  }

  public void setCity(String city) {
    this.city = city;
  }

  public String getPinCode() {
    return pinCode;
  }

  public void setPinCode(String pinCode) {
    this.pinCode = pinCode;
  }

  public MultipartFile getCompanyLogo() {
    return companyLogo;
  }

  public void setCompanyLogo(MultipartFile companyLogo) {
    this.companyLogo = companyLogo;
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

  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  public String getConfirmPassword() {
    return confirmPassword;
  }

  public void setConfirmPassword(String confirmPassword) {
    this.confirmPassword = confirmPassword;
  }

  public String getOwnerMobileNumber() {
    return ownerMobileNumber;
  }

  public void setOwnerMobileNumber(String ownerMobileNumber) {
    this.ownerMobileNumber = ownerMobileNumber;
  }
}
