
package com.ems.finance.dto;

import java.math.BigDecimal;

public class CtcResponse {

    private Long id;

    private BigDecimal totalAnnualCtc;

    private BigDecimal basicSalary;

    private BigDecimal hra;

    private BigDecimal specialAllowance;

    private BigDecimal otherAllowances;

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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
