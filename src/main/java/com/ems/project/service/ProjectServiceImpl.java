
package com.ems.project.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.ems.project.entity.Project;
import com.ems.project.repository.ProjectRepository;

@Service
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectServiceImpl(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    @Override
    public Project createProject(Project project, String tenantId) {

        validateProject(project);

        // Check duplicate project code within the same company
        if (projectRepository.findByProjectCodeAndTenantId(
                project.getProjectCode(), tenantId).isPresent()) {

            throw new RuntimeException("Project code already exists");
        }

        project.setId(null);
        project.setTenantId(tenantId);

        return projectRepository.save(project);
    }

    @Override
    public List<Project> getAllProjects(String tenantId) {

        return projectRepository.findByTenantId(tenantId);
    }

    @Override
    public Project getProjectById(Long projectId, String tenantId) {

        return projectRepository
                .findByIdAndTenantId(projectId, tenantId)
                .orElseThrow(() ->
                        new RuntimeException("Project not found"));
    }

    @Override
    public Project updateProject(
            Long projectId, Project updatedProject, String tenantId) {

        Project existingProject = getProjectById(projectId, tenantId);

        validateProject(updatedProject);

        // Check duplicate code, excluding the current project
        Project duplicateProject = projectRepository
                .findByProjectCodeAndTenantId(
                        updatedProject.getProjectCode(), tenantId)
                .orElse(null);

        if (duplicateProject != null &&
                !duplicateProject.getId().equals(existingProject.getId())) {

            throw new RuntimeException("Project code already exists");
        }

        existingProject.setProjectCode(updatedProject.getProjectCode());
        existingProject.setProjectName(updatedProject.getProjectName());
        existingProject.setClientName(updatedProject.getClientName());
        existingProject.setStartDate(updatedProject.getStartDate());
        existingProject.setEndDate(updatedProject.getEndDate());

        existingProject.setReportingManagerEmployeeCode(
                updatedProject.getReportingManagerEmployeeCode());

        existingProject.setReportingManagerEmail(
                updatedProject.getReportingManagerEmail());

        existingProject.setProjectStatus(updatedProject.getProjectStatus());

        return projectRepository.save(existingProject);
    }

    @Override
    public void deleteProject(Long projectId, String tenantId) {

        Project project = getProjectById(projectId, tenantId);

        projectRepository.delete(project);
    }

    // Project validation
    private void validateProject(Project project) {

        if (project.getProjectCode() == null ||
                project.getProjectCode().trim().isEmpty()) {

            throw new RuntimeException("Project code is required");
        }

        if (project.getProjectName() == null ||
                project.getProjectName().trim().isEmpty()) {

            throw new RuntimeException("Project name is required");
        }

        if (project.getClientName() == null ||
                project.getClientName().trim().isEmpty()) {

            throw new RuntimeException("Client name is required");
        }

        if (project.getStartDate() == null) {

            throw new RuntimeException("Project start date is required");
        }

        if (project.getEndDate() == null) {

            throw new RuntimeException("Project end date is required");
        }

        if (project.getEndDate().isBefore(project.getStartDate())) {

            throw new RuntimeException(
                    "Project end date cannot be earlier than start date");
        }

        if (project.getReportingManagerEmployeeCode() == null ||
                project.getReportingManagerEmployeeCode().trim().isEmpty()) {

            throw new RuntimeException(
                    "Reporting manager employee code is required");
        }

        if (project.getReportingManagerEmail() == null ||
                project.getReportingManagerEmail().trim().isEmpty()) {

            throw new RuntimeException(
                    "Reporting manager email is required");
        }

        if (!project.getReportingManagerEmail().matches(
                "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {

            throw new RuntimeException(
                    "Invalid reporting manager email");
        }
    }
}
