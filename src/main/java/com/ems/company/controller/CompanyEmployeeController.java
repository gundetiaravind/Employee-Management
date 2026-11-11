package com.ems.company.controller;

import com.ems.company.dto.CompanyCreateEmployeeRequest;
import com.ems.company.dto.CompanyEmployeeResponse;
import com.ems.company.dto.CompanyUpdateEmployeeRequest;
import com.ems.company.service.CompanyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/company-owner/employees", "/api/company/employees"})
public class CompanyEmployeeController {

  private final CompanyService companyService;

  public CompanyEmployeeController(CompanyService companyService) {
    this.companyService = companyService;
  }

  @PostMapping
  public ResponseEntity<CompanyEmployeeResponse> create(
      @Valid @RequestBody CompanyCreateEmployeeRequest request,
      @RequestParam(required = false) Long companyId,
      @RequestHeader(value = "X-Company-Id", required = false) Long headerCompanyId) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(companyService.createEmployee(resolveCompanyId(companyId, headerCompanyId), request));
  }

  @GetMapping
  public ResponseEntity<List<CompanyEmployeeResponse>> list(
      @RequestParam(required = false) Long companyId,
      @RequestHeader(value = "X-Company-Id", required = false) Long headerCompanyId) {
    return ResponseEntity.ok(companyService.listEmployees(resolveCompanyId(companyId, headerCompanyId)));
  }

  @GetMapping("/{id}")
  public ResponseEntity<CompanyEmployeeResponse> get(
      @PathVariable Long id,
      @RequestParam(required = false) Long companyId,
      @RequestHeader(value = "X-Company-Id", required = false) Long headerCompanyId) {
    return ResponseEntity.ok(companyService.getEmployee(resolveCompanyId(companyId, headerCompanyId), id));
  }

  @PutMapping("/{id}")
  public ResponseEntity<CompanyEmployeeResponse> update(
      @PathVariable Long id,
      @Valid @RequestBody CompanyUpdateEmployeeRequest request,
      @RequestParam(required = false) Long companyId,
      @RequestHeader(value = "X-Company-Id", required = false) Long headerCompanyId) {
    return ResponseEntity.ok(
        companyService.updateEmployee(resolveCompanyId(companyId, headerCompanyId), id, request));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Map<String, String>> delete(
      @PathVariable Long id,
      @RequestParam(required = false) Long companyId,
      @RequestHeader(value = "X-Company-Id", required = false) Long headerCompanyId) {
    companyService.deleteEmployee(resolveCompanyId(companyId, headerCompanyId), id);
    return ResponseEntity.ok(Map.of("message", "Employee deactivated successfully"));
  }

  private Long resolveCompanyId(Long query, Long header) {
    if (header != null) return header;
    if (query != null) return query;
    throw new RuntimeException("companyId is required. Pass ?companyId=1 or header X-Company-Id: 1");
  }
}
