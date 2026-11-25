package com.ems.payslip.controller;

import com.ems.payslip.dto.EmployeePayslipResponse;
import com.ems.payslip.service.EmployeePayslipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payslips")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class EmployeePayslipController {

    private final EmployeePayslipService employeePayslipService;

    // Employee - get logged-in employee's payslips
    @GetMapping("/me")
    public ResponseEntity<List<EmployeePayslipResponse>> getMyPayslips(
            Authentication authentication) {

        return ResponseEntity.ok(
                employeePayslipService.getMyPayslips(
                        authentication.getName())
        );
    }

    // Employee - get one payslip
    @GetMapping("/{id}")
    public ResponseEntity<EmployeePayslipResponse> getPayslip(
            @PathVariable Long id,
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                employeePayslipService.getPayslipById(
                        id, authentication.getName())
        );
    }


}