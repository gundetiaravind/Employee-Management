package com.ems.company.controller;

import com.ems.company.dto.CompanyAdminResponse;
import com.ems.company.dto.CompanyCreateAdminRequest;
import com.ems.company.dto.CompanyUpdateAdminRequest;
import com.ems.company.service.CompanyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/company-owner/admins", "/api/company/admins"})
public class CompanyAdminController {

  private final CompanyService companyService;

  public CompanyAdminController(CompanyService companyService) {
    this.companyService = companyService;
  }

  @PostMapping
  public ResponseEntity<CompanyAdminResponse> create(
      @Valid @RequestBody CompanyCreateAdminRequest request,
      @RequestParam(required = false) Long companyId,
      @RequestHeader(value = "X-Company-Id", required = false) Long headerCompanyId) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(companyService.createAdmin(resolveCompanyId(companyId, headerCompanyId), request));
  }

  @GetMapping
  public ResponseEntity<List<CompanyAdminResponse>> list(
      @RequestParam(required = false) Long companyId,
      @RequestHeader(value = "X-Company-Id", required = false) Long headerCompanyId) {
    return ResponseEntity.ok(companyService.listAdmins(resolveCompanyId(companyId, headerCompanyId)));
  }

  @GetMapping("/{id}")
  public ResponseEntity<CompanyAdminResponse> get(
      @PathVariable Long id,
      @RequestParam(required = false) Long companyId,
      @RequestHeader(value = "X-Company-Id", required = false) Long headerCompanyId) {
    return ResponseEntity.ok(companyService.getAdmin(resolveCompanyId(companyId, headerCompanyId), id));
  }

  @PutMapping("/{id}")
  public ResponseEntity<CompanyAdminResponse> update(
      @PathVariable Long id,
      @Valid @RequestBody CompanyUpdateAdminRequest request,
      @RequestParam(required = false) Long companyId,
      @RequestHeader(value = "X-Company-Id", required = false) Long headerCompanyId) {
    return ResponseEntity.ok(
        companyService.updateAdmin(resolveCompanyId(companyId, headerCompanyId), id, request));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Map<String, String>> delete(
      @PathVariable Long id,
      @RequestParam(required = false) Long companyId,
      @RequestHeader(value = "X-Company-Id", required = false) Long headerCompanyId) {
    companyService.deleteAdmin(resolveCompanyId(companyId, headerCompanyId), id);
    return ResponseEntity.ok(Map.of("message", "Admin removed successfully"));
  }

  private Long resolveCompanyId(Long query, Long header) {
    if (header != null) return header;
    if (query != null) return query;
    throw new RuntimeException("companyId is required. Pass ?companyId=1 or header X-Company-Id: 1");
  }
}
