package com.ems.employee.controller;

import com.ems.employee.dto.EmployeeProfileResponse;
import com.ems.employee.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping("/me")
    public ResponseEntity<EmployeeProfileResponse> getMyProfile(
            Authentication authentication) {

        return ResponseEntity.ok(
                employeeService.getMyProfile(authentication.getName())
        );
    }
}