package com.ems.employee.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class EmployeeDashboardActivityResponse {

    private String type;
    private String title;
    private String description;
    private LocalDateTime occurredAt;
}
