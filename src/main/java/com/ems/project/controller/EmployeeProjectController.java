
package com.ems.project.controller;

import java.util.List;
import java.util.stream.Collectors;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ems.project.dto.AssignProjectRequest;
import com.ems.project.dto.EmployeeProjectResponse;
import com.ems.project.entity.EmployeeProject;
import com.ems.project.mapper.EmployeeProjectMapper;
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
    @PostMapping("/employees/projects")
    public ResponseEntity<EmployeeProjectResponse> assignEmployee(
            @Valid @RequestBody AssignProjectRequest request,
            @RequestParam String tenantId) {

        EmployeeProject assignment =
                assignmentService.assignEmployeeToProject(
                        request.getEmployeeId(),
                        request.getProjectId(),
                        tenantId);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(EmployeeProjectMapper.toResponse(assignment));
    }

    // Change an employee's project
    @PutMapping("/employee-projects/{assignmentId}")
    public ResponseEntity<EmployeeProjectResponse> changeAssignment(
            @PathVariable Long assignmentId,
            @RequestParam Long newProjectId,
            @RequestParam String tenantId) {

        EmployeeProject assignment =
                assignmentService.changeProjectAssignment(
                        assignmentId, newProjectId, tenantId);

        return ResponseEntity.ok(
                EmployeeProjectMapper.toResponse(assignment));
    }

    // Close an assignment
    @PatchMapping("/employee-projects/{assignmentId}/close")
    public ResponseEntity<EmployeeProjectResponse> closeAssignment(
            @PathVariable Long assignmentId,
            @RequestParam String tenantId) {

        EmployeeProject assignment =
                assignmentService.closeProjectAssignment(
                        assignmentId, tenantId);

        return ResponseEntity.ok(
                EmployeeProjectMapper.toResponse(assignment));
    }

    // View current assignments
    @GetMapping("/employees/{employeeId}/projects/current")
    public ResponseEntity<List<EmployeeProjectResponse>> getCurrentAssignments(
            @PathVariable Long employeeId,
            @RequestParam String tenantId) {

        List<EmployeeProjectResponse> response =
                assignmentService.getCurrentAssignments(employeeId, tenantId)
                        .stream()
                        .map(EmployeeProjectMapper::toResponse)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // View assignment history
    @GetMapping("/employees/{employeeId}/projects/history")
    public ResponseEntity<List<EmployeeProjectResponse>> getAssignmentHistory(
            @PathVariable Long employeeId,
            @RequestParam String tenantId) {

        List<EmployeeProjectResponse> response =
                assignmentService.getAssignmentHistory(employeeId, tenantId)
                        .stream()
                        .map(EmployeeProjectMapper::toResponse)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }
}
