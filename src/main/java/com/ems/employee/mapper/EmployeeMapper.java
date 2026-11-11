package com.ems.employee.mapper;

import com.ems.employee.dto.EmployeeProfileResponse;
import com.ems.employee.entity.Employee;
import org.springframework.stereotype.Component;

@Component
public class EmployeeMapper {

    public EmployeeProfileResponse toProfileResponse(Employee employee) {

        return EmployeeProfileResponse.builder()
                .id(employee.getId())
                .employeeId(employee.getEmploymentCode())
                .name(employee.getName())
                .email(employee.getEmail())
                .phone(employee.getPhone())
                .alterPhone(employee.getAlternatePhone())
                .address(employee.getAddress())
                .city(employee.getCity())
                .state(employee.getState())
                .postalCode(employee.getPostalCode())
                .department(employee.getDepartment())
                .designation(employee.getDesignation())
                .joiningDate(employee.getDateOfJoining())
                .employmentType(employee.getEmploymentType())
                .profilePhotoUrl(employee.getProfilePhotoUrl())
                .build();
    }
}