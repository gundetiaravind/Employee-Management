package com.ems.project.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ems.project.entity.EmployeeProject;
import com.ems.project.service.EmployeeProjectService;

@RestController
@RequestMapping("/api")
public class EmployeeProjectController {

    private final EmployeeProjectService assignmentService;

    public EmployeeProjectController(
            EmployeeProjectService assignmentService) {
        this.assignmentService = assignmentService;
    }

    // Assign employee to a project
    @PostMapping("/employees/{employeeId}/projects/{projectId}")
    public ResponseEntity<EmployeeProject> assignEmployee(
            @PathVariable Long employeeId,
            @PathVariable Long projectId,
            @RequestParam String tenantId) {

        EmployeeProject assignment =
                assignmentService.assignEmployeeToProject(
                        employeeId, projectId, tenantId);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(assignment);
    }

    // Change an employee's project
    @PutMapping("/employee-projects/{assignmentId}")
    public ResponseEntity<EmployeeProject> changeAssignment(
            @PathVariable Long assignmentId,
            @RequestParam Long newProjectId,
            @RequestParam String tenantId) {

        EmployeeProject assignment =
                assignmentService.changeProjectAssignment(
                        assignmentId, newProjectId, tenantId);

        return ResponseEntity.ok(assignment);
    }

    // Close an assignment
    @PatchMapping("/employee-projects/{assignmentId}/close")
    public ResponseEntity<EmployeeProject> closeAssignment(
            @PathVariable Long assignmentId,
            @RequestParam String tenantId) {

        EmployeeProject assignment =
                assignmentService.closeProjectAssignment(
                        assignmentId, tenantId);

        return ResponseEntity.ok(assignment);
    }

    // View current assignments
    @GetMapping("/employees/{employeeId}/projects/current")
    public ResponseEntity<List<EmployeeProject>> getCurrentAssignments(
            @PathVariable Long employeeId,
            @RequestParam String tenantId) {

        return ResponseEntity.ok(
                assignmentService.getCurrentAssignments(
                        employeeId, tenantId));
    }

    // View previous and current assignment history
    @GetMapping("/employees/{employeeId}/projects/history")
    public ResponseEntity<List<EmployeeProject>> getAssignmentHistory(
            @PathVariable Long employeeId,
            @RequestParam String tenantId) {

        return ResponseEntity.ok(
                assignmentService.getAssignmentHistory(
                        employeeId, tenantId));
    }
}