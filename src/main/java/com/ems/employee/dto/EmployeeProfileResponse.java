package com.ems.employee.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeProfileResponse {

    private Long id;

    private String employeeId;

    private String name;
    private String email;
    private String phone;
    private String alterPhone;

    private String address;
    private String city;
    private String state;
    private String postalCode;

    private String department;
    private String designation;

    private LocalDate joiningDate;

    private String employmentType;

    private String profilePhotoUrl;

    private String reportingManager;
}