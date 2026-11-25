
package com.ems.project.controller;

import java.util.List;
<<<<<<< HEAD
import java.util.stream.Collectors;

import jakarta.validation.Valid;
=======
>>>>>>> 77a32eef50f3c6f282137fa19a52b6ed9a28e101

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ems.project.dto.AssignProjectRequest;
import com.ems.project.dto.EmployeeProjectResponse;
<<<<<<< HEAD
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
=======
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
>>>>>>> 77a32eef50f3c6f282137fa19a52b6ed9a28e101
    }
}
