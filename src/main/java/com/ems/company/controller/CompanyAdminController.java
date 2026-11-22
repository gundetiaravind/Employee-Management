
package com.ems.company.controller;

import com.ems.company.dto.CompanyAdminResponse;
import com.ems.company.dto.CompanyUpdateAdminRequest;
import com.ems.company.service.CompanyService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({
    "/api/company-owner/admins",
    "/api/company/admins"
})
public class CompanyAdminController {

  private final CompanyService companyService;

  public CompanyAdminController(CompanyService companyService) {
    this.companyService = companyService;
  }

  // ==================== LIST ADMINS ====================

  @GetMapping
  public ResponseEntity<List<CompanyAdminResponse>> list() {

    return ResponseEntity.ok(
        companyService.listAdmins(null));
  }

  // ==================== GET ADMIN BY ID ====================

  @GetMapping("/{id}")
  public ResponseEntity<CompanyAdminResponse> get(
      @PathVariable Long id) {

    return ResponseEntity.ok(
        companyService.getAdmin(null, id));
  }

  // ==================== UPDATE ADMIN ====================

  @PutMapping("/{id}")
  public ResponseEntity<CompanyAdminResponse> update(
      @PathVariable Long id,
      @Valid @RequestBody CompanyUpdateAdminRequest request) {

    return ResponseEntity.ok(
        companyService.updateAdmin(null, id, request));
  }

  // ==================== DELETE ADMIN ====================

  @DeleteMapping("/{id}")
  public ResponseEntity<Map<String, String>> delete(
      @PathVariable Long id) {

    companyService.deleteAdmin(null, id);

    return ResponseEntity.ok(
        Map.of("message", "Admin removed successfully"));
  }
}
