package com.ems.project.service;

import java.util.List;

import com.ems.project.entity.EmployeeProject;

public interface EmployeeProjectService {

    EmployeeProject assignEmployeeToProject(
            Long employeeId, Long projectId,
            String tenantId);

    EmployeeProject changeProjectAssignment(
            Long assignmentId, Long newProjectId,
            String tenantId);

    EmployeeProject closeProjectAssignment(
            Long assignmentId, String tenantId);

    List<EmployeeProject> getCurrentAssignments(
            Long employeeId, String tenantId);

    List<EmployeeProject> getAssignmentHistory(
            Long employeeId, String tenantId);
}