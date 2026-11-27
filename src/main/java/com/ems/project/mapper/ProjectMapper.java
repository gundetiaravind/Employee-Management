
package com.ems.project.mapper;

import com.ems.project.dto.ProjectResponse;
import com.ems.project.entity.Project;

public class ProjectMapper {

    public static ProjectResponse toResponse(Project project) {

        ProjectResponse response = new ProjectResponse();

        response.setId(project.getId());
        response.setTenantId(project.getTenantId());
        response.setProjectCode(project.getProjectCode());
        response.setProjectName(project.getProjectName());
        response.setClientName(project.getClientName());
        response.setProjectStatus(project.getProjectStatus());
        response.setStartDate(project.getStartDate());
        response.setEndDate(project.getEndDate());
        response.setReportingManagerEmployeeCode(
                project.getReportingManagerEmployeeCode());
        response.setReportingManagerEmail(
                project.getReportingManagerEmail());
        response.setCreatedAt(project.getCreatedAt());

        return response;
    }
}
