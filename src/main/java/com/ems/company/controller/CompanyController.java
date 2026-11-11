package com.ems.company.controller;

import com.ems.company.dto.*;
import com.ems.company.service.CompanyService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Dual base paths so APIs work under either:
 *   /api/company-owner/...
 *   /api/company/...
 *
 * Example:
 *   GET /api/company/dashboard?companyId=1
 *   GET /api/company-owner/dashboard?companyId=1
 */
@RestController
@RequestMapping({"/api/company-owner", "/api/company"})
public class CompanyController {

  private final CompanyService companyService;

  public CompanyController(CompanyService companyService) {
    this.companyService = companyService;
  }

  /** Health check – no DB, no companyId. Use this to verify controller is loaded. */
  @GetMapping({"/ping", "/health"})
  public ResponseEntity<Map<String, Object>> ping() {
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("status", "OK");
    body.put("module", "company-owner");
    body.put("message", "CompanyController is loaded");
    return ResponseEntity.ok(body);
  }

  @GetMapping("/dashboard")
  public ResponseEntity<CompanyOwnerDashboardResponse> dashboard(
      @RequestParam(required = false) Long companyId,
      @RequestHeader(value = "X-Company-Id", required = false) Long headerCompanyId) {
    return ResponseEntity.ok(companyService.getDashboard(resolveCompanyId(companyId, headerCompanyId)));
  }

  @GetMapping("/settings")
  public ResponseEntity<CompanySettingsResponse> getSettings(
      @RequestParam(required = false) Long companyId,
      @RequestHeader(value = "X-Company-Id", required = false) Long headerCompanyId) {
    return ResponseEntity.ok(companyService.getCompanySettings(resolveCompanyId(companyId, headerCompanyId)));
  }

  @PutMapping("/settings")
  public ResponseEntity<CompanySettingsResponse> updateSettings(
      @Valid @RequestBody CompanyUpdateSettingsRequest request,
      @RequestParam(required = false) Long companyId,
      @RequestHeader(value = "X-Company-Id", required = false) Long headerCompanyId) {
    return ResponseEntity.ok(
        companyService.updateCompanySettings(resolveCompanyId(companyId, headerCompanyId), request));
  }

  @GetMapping("/profile")
  public ResponseEntity<CompanyOwnerProfileResponse> profile(
      @RequestParam(required = false) Long companyId,
      @RequestHeader(value = "X-Company-Id", required = false) Long headerCompanyId) {
    return ResponseEntity.ok(companyService.getOwnerProfile(resolveCompanyId(companyId, headerCompanyId)));
  }

  private Long resolveCompanyId(Long query, Long header) {
    if (header != null) return header;
    if (query != null) return query;
    throw new RuntimeException("companyId is required. Pass ?companyId=1 or header X-Company-Id: 1");
  }
}
