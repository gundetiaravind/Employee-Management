package com.ems.employee.service;

import com.ems.employee.dto.EmployeeDashboardResponse;

public interface EmployeeDashboardService {

    EmployeeDashboardResponse getDashboard(String email);
}
