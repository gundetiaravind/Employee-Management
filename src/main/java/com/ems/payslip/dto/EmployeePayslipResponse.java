package com.ems.payslip.dto;

import com.ems.payslip.entity.PayslipStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeePayslipResponse {

    private Long id;

    private Long employeeId;

    private String employeeName;

    private String employeeCode;

    private String payMonth;

    private Integer payYear;

    private LocalDate payDate;

    // Earnings

    private BigDecimal basicSalary;

    private BigDecimal hra;

    private BigDecimal allowances;

    private BigDecimal bonus;

    // Deductions

    private BigDecimal providentFund;

    private BigDecimal tax;

    private BigDecimal otherDeductions;

    // Calculated

    private BigDecimal grossSalary;

    private BigDecimal totalDeductions;

    private BigDecimal netSalary;

    private PayslipStatus status;
}