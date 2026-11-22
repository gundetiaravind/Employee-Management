package com.ems.platformmanager.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ems.platformmanager.dto.CompanyManagementResponse;
import com.ems.platformmanager.service.CompanyManagementService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/platform/companies")
@RequiredArgsConstructor
public class PlatformManagerController {

    private final CompanyManagementService companyManagementService;

    // Get all companies or filter by status
    @GetMapping
    public ResponseEntity<List<CompanyManagementResponse>> getAllCompanies(
            @RequestParam(required = false) String status) {

        return ResponseEntity.ok(
                companyManagementService.getAllCompanies(status)
        );
    }

    // Approve company
    @PostMapping("/{companyId}/approve")
    public ResponseEntity<CompanyManagementResponse> approveCompany(
            @PathVariable Long companyId) {

        return ResponseEntity.ok(
                companyManagementService.approveCompany(companyId)
        );
    }

    // Reject company
    @PostMapping("/{companyId}/reject")
    public ResponseEntity<CompanyManagementResponse> rejectCompany(
            @PathVariable Long companyId) {

        return ResponseEntity.ok(
                companyManagementService.rejectCompany(companyId)
        );
    }
}