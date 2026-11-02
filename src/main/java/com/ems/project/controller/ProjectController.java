package com.ems.project.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ems.project.entity.Project;
import com.ems.project.service.ProjectService;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping
    public ResponseEntity<Project> createProject(
            @RequestBody Project project,
            @RequestParam String tenantId) {

        Project savedProject =
                projectService.createProject(project, tenantId);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedProject);
    }

    @GetMapping
    public ResponseEntity<List<Project>> getAllProjects(
            @RequestParam String tenantId) {

        return ResponseEntity.ok(
                projectService.getAllProjects(tenantId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(
            @PathVariable Long id,
            @RequestParam String tenantId) {

        return ResponseEntity.ok(
                projectService.getProjectById(id, tenantId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Project> updateProject(
            @PathVariable Long id,
            @RequestBody Project project,
            @RequestParam String tenantId) {

        return ResponseEntity.ok(
                projectService.updateProject(id, project, tenantId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(
            @PathVariable Long id,
            @RequestParam String tenantId) {

        projectService.deleteProject(id, tenantId);

        return ResponseEntity.noContent().build();
    }
}