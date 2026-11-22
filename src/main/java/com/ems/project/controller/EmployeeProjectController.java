
package com.ems.project.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ems.project.dto.AssignProjectRequest;
import com.ems.project.dto.EmployeeProjectResponse;
import com.ems.project.service.EmployeeProjectService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/employee-projects")
public class EmployeeProjectController {

    private final EmployeeProjectService employeeProjectService;

    public EmployeeProjectController(
            EmployeeProjectService employeeProjectService) {
        this.employeeProjectService = employeeProjectService;
    }

    // Assign employee to project
    @PostMapping
    public ResponseEntity<EmployeeProjectResponse> assignEmployee(
            @Valid @RequestBody AssignProjectRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(employeeProjectService.assignEmployeeToProject(request));
    }

    // View all assignments
    @GetMapping
    public ResponseEntity<List<EmployeeProjectResponse>> getAllAssignments() {

        return ResponseEntity.ok(
                employeeProjectService.getAllAssignments());
    }

    // View assignments by employee
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<EmployeeProjectResponse>> getByEmployee(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                employeeProjectService.getAssignmentsByEmployeeId(employeeId));
    }

    // View assignments by project
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<EmployeeProjectResponse>> getByProject(
            @PathVariable Long projectId) {

        return ResponseEntity.ok(
                employeeProjectService.getAssignmentsByProjectId(projectId));
    }

    // View individual assignment
    @GetMapping("/{id}")
    public ResponseEntity<EmployeeProjectResponse> getById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                employeeProjectService.getAssignmentById(id));
    }

    // Update assignment
    @PutMapping("/{id}")
    public ResponseEntity<EmployeeProjectResponse> updateAssignment(
            @PathVariable Long id,
            @Valid @RequestBody AssignProjectRequest request) {

        return ResponseEntity.ok(
                employeeProjectService.updateAssignment(id, request));
    }

    // Close assignment
    @PatchMapping("/{id}/close")
    public ResponseEntity<Void> closeAssignment(
            @PathVariable Long id) {

        employeeProjectService.closeAssignment(id);
        return ResponseEntity.noContent().build();
    }
}
