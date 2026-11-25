package com.ems.employee.controller;

import com.ems.employee.dto.EmployeeDashboardResponse;
import com.ems.employee.service.EmployeeDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/employees/me/dashboard")
@RequiredArgsConstructor
public class EmployeeDashboardController {

    private final EmployeeDashboardService employeeDashboardService;

    @GetMapping
    public ResponseEntity<EmployeeDashboardResponse> getDashboard(
            Authentication authentication) {
        return ResponseEntity.ok(
                employeeDashboardService.getDashboard(authentication.getName()));
    }
}
