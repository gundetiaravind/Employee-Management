
package com.ems.finance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class FinanceRequest {

    @NotBlank(message = "PAN number is required")
    @Pattern(
        regexp = "[A-Z]{5}[0-9]{4}[A-Z]",
        message = "Invalid PAN number format"
    )
    private String panNumber;

    @NotBlank(message = "Aadhaar number is required")
    @Pattern(
        regexp = "[0-9]{12}",
        message = "Aadhaar number must contain exactly 12 digits"
    )
    private String aadhaarNumber;

    @NotBlank(message = "Bank name is required")
    private String bankName;

    @NotBlank(message = "Branch name is required")
    private String branchName;

    @NotBlank(message = "IFSC code is required")
    @Pattern(
        regexp = "[A-Z]{4}0[A-Z0-9]{6}",
        message = "Invalid IFSC code format"
    )
    private String ifscCode;

    // Getters and Setters

    public String getPanNumber() {
        return panNumber;
    }

    public void setPanNumber(String panNumber) {
        this.panNumber = panNumber;
    }

    public String getAadhaarNumber() {
        return aadhaarNumber;
    }

    public void setAadhaarNumber(String aadhaarNumber) {
        this.aadhaarNumber = aadhaarNumber;
    }

    public String getBankName() {
        return bankName;
    }

    public void setBankName(String bankName) {
        this.bankName = bankName;
    }

    public String getBranchName() {
        return branchName;
    }

    public void setBranchName(String branchName) {
        this.branchName = branchName;
    }

    public String getIfscCode() {
        return ifscCode;
    }

    public void setIfscCode(String ifscCode) {
        this.ifscCode = ifscCode;
    }
}
