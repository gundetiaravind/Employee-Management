
package com.ems.invitation.controller;

import com.ems.invitation.dto.EmployeeInvitationRequest;
import com.ems.invitation.dto.EmployeeInvitationResponse;
import com.ems.invitation.dto.EmployeeRegistrationRequest;
import com.ems.invitation.dto.ValidateInvitationResponse;
import com.ems.invitation.service.EmployeeInvitationService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invitations")
@RequiredArgsConstructor
public class EmployeeInvitationController {

  private final EmployeeInvitationService invitationService;

  // ==================== SEND INVITATION ====================

  @PostMapping
  public ResponseEntity<EmployeeInvitationResponse> sendInvitation(
      @Valid @RequestBody EmployeeInvitationRequest request,
      Authentication authentication) {

    EmployeeInvitationResponse response = invitationService.sendInvitation(
        request,
        authentication.getName());

    return ResponseEntity
        .status(HttpStatus.CREATED)
        .body(response);
  }

  // ==================== GET COMPANY INVITATIONS ====================

  @GetMapping
  public ResponseEntity<List<EmployeeInvitationResponse>> getCompanyInvitations(
      Authentication authentication) {

    List<EmployeeInvitationResponse> invitations = invitationService.getCompanyInvitations(
        authentication.getName());

    return ResponseEntity.ok(invitations);
  }

  // ==================== VALIDATE INVITATION ====================

  @GetMapping("/validate")
  public ResponseEntity<ValidateInvitationResponse> validateInvitation(
      @RequestParam String token) {

    ValidateInvitationResponse response = invitationService.validateInvitation(token);

    return ResponseEntity.ok(response);
  }

  // ==================== ACCEPT INVITATION ====================

  @PostMapping("/accept")
  public ResponseEntity<EmployeeInvitationResponse> acceptInvitation(
      @Valid @RequestBody EmployeeRegistrationRequest request) {

    EmployeeInvitationResponse response = invitationService.acceptInvitation(request);

    return ResponseEntity
        .status(HttpStatus.CREATED)
        .body(response);
  }

  // ==================== REVOKE INVITATION ====================

  @DeleteMapping("/{invitationId}")
  public ResponseEntity<Void> revokeInvitation(
      @PathVariable Long invitationId,
      Authentication authentication) {

    invitationService.revokeInvitation(
        invitationId,
        authentication.getName());

    return ResponseEntity.noContent().build();
  }
}
