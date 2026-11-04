
package com.ems.company.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class CompanyRegistrationRequest {

    // Company Information

    @NotBlank(message = "Company name is required")
    @Size(max = 150)
    private String companyName;

    private MultipartFile companyLogo;

    @NotBlank(message = "Registration number is required")
    @Size(max = 100)
    private String registrationNumber;

    @NotBlank(message = "Company type is required")
    private String companyType;

    @NotBlank(message = "Industry is required")
    private String industry;

    @NotBlank(message = "Company phone is required")
    @Size(max = 20)
    private String companyPhone;

    @Size(max = 20)
    private String alternatePhone;

    @Size(max = 255)
    private String companyWebsite;

    @NotBlank(message = "Country is required")
    private String country;

    @NotBlank(message = "State is required")
    private String state;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "PIN code is required")
    @Size(max = 15)
    private String pinCode;

    @NotBlank(message = "Complete address is required")
    @Size(max = 500)
    private String companyAddress;


    // Owner Information

    @NotBlank(message = "Owner name is required")
    @Size(max = 100)
    private String ownerName;

    @NotBlank(message = "Owner email is required")
    @Email(message = "Enter a valid email address")
    @Size(max = 150)
    private String ownerEmail;

    @NotBlank(message = "Owner mobile number is required")
    @Size(max = 20)
    private String ownerMobileNumber;


    // Login Credentials

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 72)
    private String password;

    @NotBlank(message = "Confirm password is required")
    private String confirmPassword;
}
