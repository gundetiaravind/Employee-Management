
package com.ems.invitation.service;

import com.ems.invitation.dto.EmployeeInvitationRequest;
import com.ems.invitation.dto.EmployeeInvitationResponse;
import com.ems.invitation.dto.EmployeeRegistrationRequest;
import com.ems.invitation.dto.ValidateInvitationResponse;

import java.util.List;

public interface EmployeeInvitationService {

  // Send an employee invitation
  EmployeeInvitationResponse sendInvitation(
      EmployeeInvitationRequest request,
      String authenticatedUserEmail);

  // Validate an invitation token
  ValidateInvitationResponse validateInvitation(String token);

  // Accept invitation and complete employee registration
  EmployeeInvitationResponse acceptInvitation(
      EmployeeRegistrationRequest request);

  // List invitations belonging to authenticated user's company
  List<EmployeeInvitationResponse> getCompanyInvitations(
      String authenticatedUserEmail);

  // Revoke a pending invitation
  void revokeInvitation(
      Long invitationId,
      String authenticatedUserEmail);
}
