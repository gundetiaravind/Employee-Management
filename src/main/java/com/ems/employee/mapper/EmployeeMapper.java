
package com.ems.employee.mapper;

import com.ems.employee.dto.EmployeeProfileResponse;
import com.ems.employee.entity.Employee;

import org.springframework.stereotype.Component;

@Component
public class EmployeeMapper {

    public EmployeeProfileResponse toProfileResponse(Employee employee) {

        if (employee == null) {
            return null;
        }

        return EmployeeProfileResponse.builder()
                .id(employee.getId())
                .employeeId(employee.getEmploymentCode())
                .name(employee.getEmployeeName())
                .email(employee.getCompanyEmail())
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
                .reportingManager(
                        employee.getReportingManager() != null
                                ? employee.getReportingManager().getEmployeeName()
                                : employee.getManagerName())
                .build();
    }
}
