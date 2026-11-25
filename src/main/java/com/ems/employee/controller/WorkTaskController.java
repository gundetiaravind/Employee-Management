package com.ems.employee.controller;

import com.ems.employee.dto.UpdateTaskStatusRequest;
import com.ems.employee.dto.WorkTaskResponse;
import com.ems.employee.entity.Employee;
import com.ems.employee.repository.EmployeeRepository;
import com.ems.employee.service.WorkTaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/work")
public class WorkTaskController {

    private final WorkTaskService workTaskService;
    private final EmployeeRepository employeeRepository;

    public WorkTaskController(
            WorkTaskService workTaskService,
            EmployeeRepository employeeRepository) {

        this.workTaskService = workTaskService;
        this.employeeRepository = employeeRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<List<WorkTaskResponse>> getMyTasks(
            Authentication authentication) {

        String email = authentication.getName();

        Employee employee = employeeRepository
                .findByCompanyEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Employee not found with email: " + email));

        List<WorkTaskResponse> tasks =
                workTaskService.getMyWorkTasks(employee.getId());

        return ResponseEntity.ok(tasks);
    }

    @PutMapping("/{taskId}/status")
    public ResponseEntity<WorkTaskResponse> updateTaskStatus(
            @PathVariable Long taskId,
            @Valid @RequestBody UpdateTaskStatusRequest request,
            Authentication authentication) {

        String email = authentication.getName();
        Employee employee = employeeRepository
                .findByCompanyEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Employee not found with email: " + email));

        return ResponseEntity.ok(
                workTaskService.updateStatus(
                        employee.getId(), taskId, request.getStatus())
        );
    }
}
