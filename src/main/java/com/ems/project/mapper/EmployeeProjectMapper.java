package com.ems.project.mapper;

import com.ems.project.dto.EmployeeProjectResponse;
import com.ems.project.entity.EmployeeProject;

public class EmployeeProjectMapper {

    public static EmployeeProject toEntity(
            Long employeeId, Long projectId, String tenantId) {

        EmployeeProject assignment = new EmployeeProject();

        assignment.setEmployeeId(employeeId);
        assignment.setProjectId(projectId);
        assignment.setTenantId(tenantId);

        return assignment;
    }

    public static EmployeeProjectResponse toResponse(EmployeeProject assignment) {

        EmployeeProjectResponse response = new EmployeeProjectResponse();

        response.setId(assignment.getId());
        response.setEmployeeId(assignment.getEmployeeId());
        response.setProjectId(assignment.getProjectId());
        response.setTenantId(assignment.getTenantId());
        response.setStartDate(assignment.getStartDate());
        response.setEndDate(assignment.getEndDate());
        response.setAssignmentStatus(assignment.getAssignmentStatus());

        return response;
    }
}