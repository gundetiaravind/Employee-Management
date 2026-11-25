package com.ems.payslip.dto;

import com.ems.payslip.entity.PayslipStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeePayslipRequest {

    @NotNull
    private Long employeeId;

    @NotBlank
    private String payMonth;

    @NotNull
    private Integer payYear;

    @NotNull
    private LocalDate payDate;

    // Earnings

    @NotNull
    @DecimalMin(value = "0.0")
    private BigDecimal basicSalary;

    @NotNull
    @DecimalMin(value = "0.0")
    private BigDecimal hra;

    @NotNull
    @DecimalMin(value = "0.0")
    private BigDecimal allowances;

    @NotNull
    @DecimalMin(value = "0.0")
    private BigDecimal bonus;

    // Deductions

    @NotNull
    @DecimalMin(value = "0.0")
    private BigDecimal providentFund;

    @NotNull
    @DecimalMin(value = "0.0")
    private BigDecimal tax;

    @NotNull
    @DecimalMin(value = "0.0")
    private BigDecimal otherDeductions;

    private PayslipStatus status;
}