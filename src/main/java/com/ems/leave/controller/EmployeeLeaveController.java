package com.ems.leave.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ems.leave.dto.LeaveApplicationRequest;
import com.ems.leave.dto.LeaveResponse;
import com.ems.leave.service.LeaveService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/employees/me/leaves")
public class EmployeeLeaveController {

    private final LeaveService leaveService;

    public EmployeeLeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    @GetMapping
    public ResponseEntity<List<LeaveResponse>> getMyLeaves(
            Authentication authentication) {

        return ResponseEntity.ok(
                leaveService.getMyLeaves(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<LeaveResponse> applyForLeave(
            @Valid @RequestBody LeaveApplicationRequest request,
            Authentication authentication) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(leaveService.applyForLeave(
                        authentication.getName(), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelMyLeave(
            @PathVariable Long id,
            Authentication authentication) {

        leaveService.cancelMyLeave(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
