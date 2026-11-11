package com.ems.employee.service;

import com.ems.employee.dto.EmployeeProfileResponse;

public interface EmployeeService {

    EmployeeProfileResponse getMyProfile(String email);
}