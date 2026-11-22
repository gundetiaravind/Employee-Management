
package com.ems.company.controller;

import com.ems.company.dto.CompanyEmployeeResponse;
import com.ems.company.dto.CompanyUpdateEmployeeRequest;
import com.ems.company.service.CompanyService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({
    "/api/company-owner/employees",
    "/api/company/employees"
})
public class CompanyEmployeeController {

  private final CompanyService companyService;

  public CompanyEmployeeController(CompanyService companyService) {
    this.companyService = companyService;
  }

  // ==================== LIST EMPLOYEES ====================

  @GetMapping
  public ResponseEntity<List<CompanyEmployeeResponse>> list() {

    return ResponseEntity.ok(
        companyService.listEmployees(null));
  }

  // ==================== GET EMPLOYEE BY ID ====================

  @GetMapping("/{id}")
  public ResponseEntity<CompanyEmployeeResponse> get(
      @PathVariable Long id) {

    return ResponseEntity.ok(
        companyService.getEmployee(null, id));
  }

  // ==================== UPDATE EMPLOYEE ====================

  @PutMapping("/{id}")
  public ResponseEntity<CompanyEmployeeResponse> update(
      @PathVariable Long id,
      @Valid @RequestBody CompanyUpdateEmployeeRequest request) {

    return ResponseEntity.ok(
        companyService.updateEmployee(null, id, request));
  }

  // ==================== DEACTIVATE EMPLOYEE ====================

  @DeleteMapping("/{id}")
  public ResponseEntity<Map<String, String>> delete(
      @PathVariable Long id) {

    companyService.deleteEmployee(null, id);

    return ResponseEntity.ok(
        Map.of(
            "message",
            "Employee deactivated successfully"));
  }
}
