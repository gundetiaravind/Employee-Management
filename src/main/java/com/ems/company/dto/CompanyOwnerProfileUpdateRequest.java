package com.ems.company.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class CompanyOwnerProfileUpdateRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name cannot exceed 100 characters")
    private String name;

    @Pattern(
        regexp = "^$|^[+]?[0-9]{10,15}$",
        message = "Please enter a valid phone number"
    )
    private String phone;

    public CompanyOwnerProfileUpdateRequest() {
    }

    public CompanyOwnerProfileUpdateRequest(String name, String phone) {
        this.name = name;
        this.phone = phone;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}