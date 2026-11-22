
package com.ems.payslip.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class PayslipRequest {

    @NotNull(message = "Payslip month is required")
    @Min(value = 1, message = "Month must be between 1 and 12")
    @Max(value = 12, message = "Month must be between 1 and 12")
    private Integer payslipMonth;

    @NotNull(message = "Payslip year is required")
    @Min(value = 2000, message = "Invalid payslip year")
    @Max(value = 2100, message = "Invalid payslip year")
    private Integer payslipYear;

    public Integer getPayslipMonth() {
        return payslipMonth;
    }

    public void setPayslipMonth(Integer payslipMonth) {
        this.payslipMonth = payslipMonth;
    }

    public Integer getPayslipYear() {
        return payslipYear;
    }

    public void setPayslipYear(Integer payslipYear) {
        this.payslipYear = payslipYear;
    }
}
