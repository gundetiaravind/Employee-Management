
package com.ems.project.mapper;

import org.springframework.stereotype.Component;

import com.ems.project.dto.EmployeeProjectResponse;
import com.ems.project.entity.EmployeeProject;
import com.ems.project.entity.Project;

@Component
public class EmployeeProjectMapper {

    public EmployeeProjectResponse toResponse(
            EmployeeProject assignment, Project project) {

        EmployeeProjectResponse response =
                new EmployeeProjectResponse();

        response.setId(assignment.getId());
        response.setEmployeeId(assignment.getEmployeeId());
        response.setProjectId(assignment.getProjectId());

        if (project != null) {
            response.setProjectCode(project.getProjectCode());
            response.setProjectName(project.getProjectName());
        }

        response.setProjectStartDate(assignment.getProjectStartDate());
        response.setProjectEndDate(assignment.getProjectEndDate());

        response.setAssignmentStatus(
                assignment.getAssignmentStatus());

        response.setReportingManagerEmployeeCode(
                assignment.getReportingManagerEmployeeCode());

        response.setReportingManagerEmail(
                assignment.getReportingManagerEmail());

        return response;
    }
}
