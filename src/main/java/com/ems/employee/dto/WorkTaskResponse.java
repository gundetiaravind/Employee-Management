package com.ems.employee.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class WorkTaskResponse {

    private Long id;
    private Long employeeId;
    private String title;
    private String description;
    private String project;
    private String assignedBy;
    private LocalDate assignedDate;
    private LocalDate dueDate;
    private String priority;
    private String status;
}