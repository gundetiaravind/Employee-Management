
package com.ems.project.mapper;

import org.springframework.stereotype.Component;

import com.ems.project.dto.ProjectRequest;
import com.ems.project.dto.ProjectResponse;
import com.ems.project.entity.Project;

@Component
public class ProjectMapper {

    public Project toEntity(ProjectRequest request) {
        Project project = new Project();

        project.setProjectCode(request.getProjectCode());
        project.setProjectName(request.getProjectName());
        project.setDescription(request.getDescription());
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            project.setStatus(request.getStatus());
        }

        return project;
    }

    public ProjectResponse toResponse(Project project) {
        ProjectResponse response = new ProjectResponse();

        response.setId(project.getId());
        response.setProjectCode(project.getProjectCode());
        response.setProjectName(project.getProjectName());
        response.setDescription(project.getDescription());
        response.setStartDate(project.getStartDate());
        response.setEndDate(project.getEndDate());
        response.setStatus(project.getStatus());

        return response;
    }

    public void updateEntity(Project project, ProjectRequest request) {
        project.setProjectCode(request.getProjectCode());
        project.setProjectName(request.getProjectName());
        project.setDescription(request.getDescription());
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            project.setStatus(request.getStatus());
        }
    }
}
