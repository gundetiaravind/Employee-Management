
package com.ems.project.controller;

import java.util.List;
import java.util.stream.Collectors;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ems.project.dto.CreateProjectRequest;
import com.ems.project.dto.ProjectResponse;
import com.ems.project.entity.Project;
import com.ems.project.mapper.ProjectMapper;
import com.ems.project.service.ProjectService;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    // CREATE PROJECT
    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(
            @Valid @RequestBody CreateProjectRequest request,
            @RequestParam String tenantId) {

        Project project = new Project();

        project.setProjectCode(request.getProjectCode());
        project.setProjectName(request.getProjectName());
        project.setClientName(request.getClientName());
        project.setStartDate(request.getProjectStartDate());
        project.setEndDate(request.getProjectEndDate());

        project.setReportingManagerEmployeeCode(
                request.getReportingManagerEmployeeCode());

        project.setReportingManagerEmail(
                request.getReportingManagerEmail());

        // Set default status for new projects
        project.setProjectStatus("ACTIVE");

        Project savedProject =
                projectService.createProject(project, tenantId);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ProjectMapper.toResponse(savedProject));
    }

    // VIEW ALL PROJECTS
    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getAllProjects(
            @RequestParam String tenantId) {

        List<ProjectResponse> response = projectService
                .getAllProjects(tenantId)
                .stream()
                .map(ProjectMapper::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // VIEW PROJECT BY ID
    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getProjectById(
            @PathVariable Long id,
            @RequestParam String tenantId) {

        Project project =
                projectService.getProjectById(id, tenantId);

        return ResponseEntity.ok(
                ProjectMapper.toResponse(project));
    }

    // UPDATE PROJECT
    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody CreateProjectRequest request,
            @RequestParam String tenantId) {

        Project project = new Project();

        project.setProjectCode(request.getProjectCode());
        project.setProjectName(request.getProjectName());
        project.setClientName(request.getClientName());
        project.setStartDate(request.getProjectStartDate());
        project.setEndDate(request.getProjectEndDate());

        project.setReportingManagerEmployeeCode(
                request.getReportingManagerEmployeeCode());

        project.setReportingManagerEmail(
                request.getReportingManagerEmail());

        // Do not set status here.
        // The service preserves the existing project status.

        Project updatedProject =
                projectService.updateProject(id, project, tenantId);

        return ResponseEntity.ok(
                ProjectMapper.toResponse(updatedProject));
    }

    // DELETE PROJECT
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(
            @PathVariable Long id,
            @RequestParam String tenantId) {

        projectService.deleteProject(id, tenantId);

        return ResponseEntity.noContent().build();
    }
}
