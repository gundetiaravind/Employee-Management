
package com.ems.finance.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public class CtcRequest {

    @NotNull(message = "Total annual CTC is required")
    @DecimalMin(value = "0.0", inclusive = false,
            message = "Total annual CTC must be greater than zero")
    private BigDecimal totalAnnualCtc;

    @NotNull(message = "Basic salary is required")
    @DecimalMin(value = "0.0",
            message = "Basic salary cannot be negative")
    private BigDecimal basicSalary;

    @NotNull(message = "HRA is required")
    @DecimalMin(value = "0.0",
            message = "HRA cannot be negative")
    private BigDecimal hra;

    @NotNull(message = "Special allowance is required")
    @DecimalMin(value = "0.0",
            message = "Special allowance cannot be negative")
    private BigDecimal specialAllowance;

    @NotNull(message = "Other allowances are required")
    @DecimalMin(value = "0.0",
            message = "Other allowances cannot be negative")
    private BigDecimal otherAllowances;

    // Getters and Setters

    public BigDecimal getTotalAnnualCtc() {
        return totalAnnualCtc;
    }

    public void setTotalAnnualCtc(BigDecimal totalAnnualCtc) {
        this.totalAnnualCtc = totalAnnualCtc;
    }

    public BigDecimal getBasicSalary() {
        return basicSalary;
    }

    public void setBasicSalary(BigDecimal basicSalary) {
        this.basicSalary = basicSalary;
    }

    public BigDecimal getHra() {
        return hra;
    }

    public void setHra(BigDecimal hra) {
        this.hra = hra;
    }

    public BigDecimal getSpecialAllowance() {
        return specialAllowance;
    }

    public void setSpecialAllowance(BigDecimal specialAllowance) {
        this.specialAllowance = specialAllowance;
    }

    public BigDecimal getOtherAllowances() {
        return otherAllowances;
    }

    public void setOtherAllowances(BigDecimal otherAllowances) {
        this.otherAllowances = otherAllowances;
    }
}
