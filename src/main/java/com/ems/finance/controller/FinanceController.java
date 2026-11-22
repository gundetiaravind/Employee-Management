
package com.ems.finance.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.ems.finance.dto.FinanceRequest;
import com.ems.finance.dto.FinanceResponse;
import com.ems.finance.dto.CtcRequest;
import com.ems.finance.dto.CtcResponse;
import com.ems.finance.service.FinanceService;
import com.ems.user.entity.User;
import com.ems.user.repository.UserRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/employees")
@PreAuthorize("hasRole('ADMIN')")
public class FinanceController {

    private final FinanceService financeService;
    private final UserRepository userRepository;

    public FinanceController(
            FinanceService financeService,
            UserRepository userRepository) {
        this.financeService = financeService;
        this.userRepository = userRepository;
    }

    // Get tenant ID from the authenticated user's company
    private Long getTenantId(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Authenticated user not found"));

        if (user.getCompany() == null) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Authenticated user is not associated with a company");
        }

        return user.getCompany().getId();
    }

    // Get authorized finance details
    @GetMapping("/{id}/finance")
    public ResponseEntity<FinanceResponse> getFinanceDetails(
            @PathVariable Long id,
            Authentication authentication) {

        Long tenantId = getTenantId(authentication);

        return ResponseEntity.ok(
                financeService.getFinanceDetails(id, tenantId));
    }

    // Update permitted finance details
    @PutMapping("/{id}/finance")
    public ResponseEntity<FinanceResponse> updateFinanceDetails(
            @PathVariable Long id,
            @Valid @RequestBody FinanceRequest request,
            Authentication authentication) {

        Long tenantId = getTenantId(authentication);

        return ResponseEntity.ok(
                financeService.updateFinanceDetails(id, tenantId, request));
    }

    // Get CTC breakup
    @GetMapping("/{id}/ctc")
    public ResponseEntity<CtcResponse> getCtcDetails(
            @PathVariable Long id,
            Authentication authentication) {

        Long tenantId = getTenantId(authentication);

        return ResponseEntity.ok(
                financeService.getCtcDetails(id, tenantId));
    }

    // Update CTC breakup
    @PutMapping("/{id}/ctc")
    public ResponseEntity<CtcResponse> updateCtcDetails(
            @PathVariable Long id,
            @Valid @RequestBody CtcRequest request,
            Authentication authentication) {

        Long tenantId = getTenantId(authentication);

        return ResponseEntity.ok(
                financeService.updateCtcDetails(id, tenantId, request));
    }
}
