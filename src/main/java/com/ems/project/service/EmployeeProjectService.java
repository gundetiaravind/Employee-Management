
package com.ems.project.service;

import java.util.List;

import com.ems.project.dto.AssignProjectRequest;
import com.ems.project.dto.EmployeeProjectResponse;

public interface EmployeeProjectService {

    EmployeeProjectResponse assignEmployeeToProject(
            AssignProjectRequest request);

    List<EmployeeProjectResponse> getAllAssignments();

    List<EmployeeProjectResponse> getAssignmentsByEmployeeId(
            Long employeeId);

    List<EmployeeProjectResponse> getAssignmentsByProjectId(
            Long projectId);

    EmployeeProjectResponse getAssignmentById(Long id);

    EmployeeProjectResponse updateAssignment(
            Long id, AssignProjectRequest request);

    EmployeeProjectResponse closeAssignment(Long id);
}
