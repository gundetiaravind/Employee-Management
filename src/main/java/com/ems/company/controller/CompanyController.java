
package com.ems.company.controller;

import com.ems.company.dto.CompanyOwnerDashboardResponse;
import com.ems.company.dto.CompanyOwnerProfileResponse;
import com.ems.company.dto.CompanyOwnerProfileUpdateRequest;
import com.ems.company.dto.CompanySettingsResponse;
import com.ems.company.dto.CompanyUpdateSettingsRequest;
import com.ems.company.service.CompanyService;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
//import org.springframework.web.multipart.MultipartFile;


@RestController
@RequestMapping({
    "/api/company-owner",
    "/api/company"
})
public class CompanyController {

  private final CompanyService companyService;

  public CompanyController(CompanyService companyService) {
    this.companyService = companyService;
  }

  // ==================== HEALTH CHECK ====================

  @GetMapping({ "/ping", "/health" })
  public ResponseEntity<Map<String, Object>> ping() {

    Map<String, Object> body = new LinkedHashMap<>();

    body.put("status", "OK");
    body.put("module", "company-owner");
    body.put("message", "CompanyController is loaded");

    return ResponseEntity.ok(body);
  }

  // ==================== COMPANY DASHBOARD ====================

  @GetMapping("/dashboard")
  public ResponseEntity<CompanyOwnerDashboardResponse> dashboard() {

    return ResponseEntity.ok(
        companyService.getDashboard(null));
  }

  // ==================== COMPANY SETTINGS ====================

  @GetMapping("/settings")
  public ResponseEntity<CompanySettingsResponse> getSettings() {

    return ResponseEntity.ok(
        companyService.getCompanySettings(null));
  }

  @PutMapping("/settings")
  public ResponseEntity<CompanySettingsResponse> updateSettings(
      @Valid @RequestBody CompanyUpdateSettingsRequest request) {

    return ResponseEntity.ok(
        companyService.updateCompanySettings(null, request));
  }

  // ==================== COMPANY OWNER PROFILE ====================

  @GetMapping("/profile")
  public ResponseEntity<CompanyOwnerProfileResponse> profile() {

    return ResponseEntity.ok(
        companyService.getOwnerProfile(null));
  }
  // ---------- Update Name & Phone ----------
  
  // ==================== COMPANY OWNER PROFILE ====================

  // Fetch owner profile
  // @GetMapping("/profile")
  // public ResponseEntity<CompanyOwnerProfileResponse> profile() {

  //     return ResponseEntity.ok(
  //         companyService.getOwnerProfile(null)
  //     );
  // }

  // Update personal information ONLY
  @PutMapping("/profile")
  public ResponseEntity<CompanyOwnerProfileResponse> updateOwnerProfile(
          @RequestParam Long companyId,
          @Valid @RequestBody CompanyOwnerProfileUpdateRequest request) {

      return ResponseEntity.ok(
          companyService.updateOwnerProfile(companyId, request)
      );
  }

  // Upload profile image ONLY
  @PostMapping(
      value = "/profile/image",
      consumes = MediaType.MULTIPART_FORM_DATA_VALUE
  )
  public ResponseEntity<CompanyOwnerProfileResponse> uploadOwnerProfileImage(
          @RequestParam Long companyId,
          @RequestParam("file") MultipartFile file) {

      return ResponseEntity.ok(
          companyService.uploadOwnerProfileImage(companyId, file)
      );
  }

}
