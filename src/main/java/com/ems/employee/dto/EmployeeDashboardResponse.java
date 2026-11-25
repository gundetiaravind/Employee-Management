package com.ems.employee.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class EmployeeDashboardResponse {

    private BigDecimal attendanceDaysThisMonth;
    private int leaveBalance;
    private long pendingTasks;
    private BigDecimal latestNetSalary;
    private String latestPayslipPeriod;
    private List<EmployeeDashboardActivityResponse> recentActivities;
}
