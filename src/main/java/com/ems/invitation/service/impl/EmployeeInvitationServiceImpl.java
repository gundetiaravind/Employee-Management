
package com.ems.invitation.service.impl;

import com.ems.common.enums.Role;
import com.ems.common.enums.UserStatus;
import com.ems.company.entity.Company;
import com.ems.company.entity.EmployeeStatus;
import com.ems.company.repository.CompanyRepository;
import com.ems.employee.entity.Employee;
import com.ems.employee.repository.EmployeeRepository;
import com.ems.invitation.dto.EmployeeInvitationRequest;
import com.ems.invitation.dto.EmployeeInvitationResponse;
import com.ems.invitation.dto.EmployeeRegistrationRequest;
import com.ems.invitation.dto.ValidateInvitationResponse;
import com.ems.invitation.entity.EmployeeInvitation;
import com.ems.invitation.entity.EmployeeInvitationStatus;
import com.ems.invitation.repository.EmployeeInvitationRepository;
import com.ems.invitation.service.EmployeeInvitationService;
import com.ems.invitation.util.InvitationTokenUtil;
import com.ems.notification.service.EmailService;
import com.ems.user.entity.User;
import com.ems.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeInvitationServiceImpl
    implements EmployeeInvitationService {

  private final EmployeeInvitationRepository invitationRepository;
  private final EmployeeRepository employeeRepository;
  private final UserRepository userRepository;
  private final CompanyRepository companyRepository;
  private final PasswordEncoder passwordEncoder;
  private final EmailService emailService;

  @Value("${app.frontend-url:http://localhost:5173}")
  private String frontendUrl;

  private static final long INVITATION_EXPIRY_HOURS = 48;

  // ==================== SEND INVITATION ====================

  @Override
  @Transactional
  public EmployeeInvitationResponse sendInvitation(
      EmployeeInvitationRequest request,
      String authenticatedUserEmail) {

    User inviter = getAuthorizedInviter(authenticatedUserEmail);
    Company company = inviter.getCompany();

    if (!"APPROVED".equalsIgnoreCase(company.getCompanyStatus())) {
      throw new ResponseStatusException(
          HttpStatus.CONFLICT,
          "Company must be approved before sending invitations");
    }

    Role invitedRole = request.getInvitedRole();

    if (invitedRole == null
        || (invitedRole != Role.ADMIN
            && invitedRole != Role.EMPLOYEE)) {

      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Only ADMIN and EMPLOYEE invitations are allowed");
    }

    // Only Company Owners can invite Admins.
    if (invitedRole == Role.ADMIN
        && inviter.getRole() != Role.COMPANY_OWNER) {

      throw new ResponseStatusException(
          HttpStatus.FORBIDDEN,
          "Only Company Owners can invite Admins");
    }

    String email = request.getEmail().trim().toLowerCase(Locale.ROOT);

    if (userRepository.existsByEmail(email)) {
      throw new ResponseStatusException(
          HttpStatus.CONFLICT,
          "An account with this email already exists");
    }

    // Employee-specific validation
    String code = null;

    if (invitedRole == Role.EMPLOYEE) {

      if (request.getEmploymentCode() == null
          || request.getEmploymentCode().isBlank()) {

        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "Employment code is required for Employee invitations");
      }

      code = request.getEmploymentCode().trim();

      if (employeeRepository.existsByCompanyIdAndEmploymentCode(
          company.getId(), code)) {

        throw new ResponseStatusException(
            HttpStatus.CONFLICT,
            "Employment code is already assigned");
      }

      if (employeeRepository.existsByCompanyIdAndCompanyEmail(
          company.getId(), email)) {

        throw new ResponseStatusException(
            HttpStatus.CONFLICT,
            "An employee with this email already exists");
      }

      if (invitationRepository
          .existsByCompanyIdAndEmploymentCodeAndInvitationStatus(
              company.getId(),
              code,
              EmployeeInvitationStatus.PENDING)) {

        throw new ResponseStatusException(
            HttpStatus.CONFLICT,
            "This employment code already has a pending invitation");
      }
    }

    if (invitationRepository.existsByCompanyIdAndEmailAndInvitationStatus(
        company.getId(),
        email,
        EmployeeInvitationStatus.PENDING)) {

      throw new ResponseStatusException(
          HttpStatus.CONFLICT,
          "A pending invitation already exists for this email");
    }

    String rawToken = InvitationTokenUtil.generateToken();
    String tokenHash = InvitationTokenUtil.hashToken(rawToken);

    EmployeeInvitation invitation = new EmployeeInvitation();

    invitation.setCompanyId(company.getId());
    invitation.setInvitedBy(inviter);
    invitation.setInvitedRole(invitedRole);

    invitation.setEmploymentCode(code);
    invitation.setEmployeeName(request.getEmployeeName().trim());
    invitation.setEmail(email);
    invitation.setPhone(request.getPhone());
    invitation.setDepartment(request.getDepartment());
    invitation.setDesignation(request.getDesignation());
    invitation.setManagerName(request.getManagerName());
    invitation.setDateOfJoining(request.getDateOfJoining());

    invitation.setTokenHash(tokenHash);
    invitation.setExpiresAt(
        LocalDateTime.now().plusHours(INVITATION_EXPIRY_HOURS));
    invitation.setInvitationStatus(EmployeeInvitationStatus.PENDING);

    EmployeeInvitation savedInvitation = invitationRepository.save(invitation);

    String invitationLink = frontendUrl
        + "/employee/register?token=" + rawToken;

    String roleName = getRoleDisplayName(invitedRole);

    String htmlBody = buildInvitationEmail(
        invitation.getEmployeeName(),
        company.getCompanyName(),
        invitationLink,
        roleName);

    emailService.sendHtmlEmail(
        email,
        roleName + " Account Invitation",
        htmlBody);

    return toInvitationResponse(
        savedInvitation,
        roleName + " invitation sent successfully");
  }

  // ==================== VALIDATE INVITATION ====================

  @Override
  @Transactional(readOnly = true)
  public ValidateInvitationResponse validateInvitation(String token) {

    if (token == null || token.isBlank()) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Invitation token is required");
    }

    String tokenHash = InvitationTokenUtil.hashToken(token);

    EmployeeInvitation invitation = invitationRepository
        .findByTokenHash(tokenHash)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Invalid invitation link"));

    if (invitation.getInvitationStatus() != EmployeeInvitationStatus.PENDING) {

      throw new ResponseStatusException(
          HttpStatus.CONFLICT,
          "This invitation is no longer available");
    }

    if (!invitation.getExpiresAt().isAfter(LocalDateTime.now())) {
      throw new ResponseStatusException(
          HttpStatus.GONE,
          "Invitation has expired");
    }

    Company company = companyRepository
        .findById(invitation.getCompanyId())
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Company not found"));

    return ValidateInvitationResponse.builder()
        .valid(true)
        .message("Invitation is valid")
        .invitedRole(invitation.getInvitedRole())
        .employeeName(invitation.getEmployeeName())
        .email(invitation.getEmail())
        .companyName(company.getCompanyName())
        .employmentCode(invitation.getEmploymentCode())
        .department(invitation.getDepartment())
        .designation(invitation.getDesignation())
        .expiresAt(invitation.getExpiresAt())
        .build();
  }

  // ==================== ACCEPT INVITATION ====================

  @Override
  @Transactional
  public EmployeeInvitationResponse acceptInvitation(
      EmployeeRegistrationRequest request) {

    if (request.getPassword() == null
        || !request.getPassword().equals(request.getConfirmPassword())) {

      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Password and confirm password do not match");
    }

    if (request.getToken() == null || request.getToken().isBlank()) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Invitation token is required");
    }

    String tokenHash = InvitationTokenUtil.hashToken(request.getToken());

    // Lock invitation to prevent simultaneous acceptance.
    EmployeeInvitation invitation = invitationRepository
        .findByTokenHashForUpdate(tokenHash)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Invalid invitation token"));

    if (invitation.getInvitationStatus() != EmployeeInvitationStatus.PENDING) {

      throw new ResponseStatusException(
          HttpStatus.CONFLICT,
          "Invitation has already been used or revoked");
    }

    if (!invitation.getExpiresAt().isAfter(LocalDateTime.now())) {
      throw new ResponseStatusException(
          HttpStatus.GONE,
          "Invitation has expired. Please request a new invitation.");
    }

    String email = invitation.getEmail();
    Role invitedRole = invitation.getInvitedRole();

    if (invitedRole != Role.ADMIN && invitedRole != Role.EMPLOYEE) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Invalid invitation role");
    }

    if (userRepository.existsByEmail(email)) {
      throw new ResponseStatusException(
          HttpStatus.CONFLICT,
          "An account with this email already exists");
    }

    Company company = companyRepository
        .findById(invitation.getCompanyId())
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Company not found"));

    // Create User account with the role stored in the invitation.
    User user = new User();

    user.setFullName(invitation.getEmployeeName());
    user.setEmail(email);
    user.setPassword(passwordEncoder.encode(request.getPassword()));
    user.setRole(invitedRole);
    user.setAccountStatus(UserStatus.ACTIVE);
    user.setEmailVerified(true);
    user.setMobileNumber(invitation.getPhone());
    user.setCompany(company);

    User savedUser = userRepository.save(user);

    // Create Employee profile only for EMPLOYEE invitations.
    if (invitedRole == Role.EMPLOYEE) {

      Employee employee = new Employee();

      employee.setCompanyId(invitation.getCompanyId());
      employee.setUser(savedUser);
      employee.setEmploymentCode(invitation.getEmploymentCode());
      employee.setEmployeeName(invitation.getEmployeeName());
      employee.setCompanyEmail(invitation.getEmail());
      employee.setPhone(invitation.getPhone());
      employee.setDepartment(invitation.getDepartment());
      employee.setDesignation(invitation.getDesignation());
      employee.setManagerName(invitation.getManagerName());
      employee.setDateOfJoining(invitation.getDateOfJoining());

      employee.setAlternatePhone(request.getAlternatePhone());
      employee.setAddress(request.getAddress());
      employee.setCity(request.getCity());
      employee.setState(request.getState());
      employee.setPostalCode(request.getPostalCode());
      employee.setEmploymentType(request.getEmploymentType());

      employee.setEmployeeStatus(EmployeeStatus.ACTIVE);

      employeeRepository.save(employee);
    }

    // Mark invitation as accepted.
    invitation.setInvitationStatus(
        EmployeeInvitationStatus.ACCEPTED);
    invitation.setAcceptedAt(LocalDateTime.now());

    invitationRepository.save(invitation);

    String roleName = getRoleDisplayName(invitedRole);

    return toInvitationResponse(
        invitation,
        roleName + " registration completed successfully");
  }

  // ==================== LIST COMPANY INVITATIONS ====================

  @Override
  @Transactional(readOnly = true)
  public List<EmployeeInvitationResponse> getCompanyInvitations(
      String authenticatedUserEmail) {

    User inviter = getAuthorizedInviter(authenticatedUserEmail);

    Long companyId = inviter.getCompany().getId();

    return invitationRepository
        .findByCompanyIdOrderByCreatedAtDesc(companyId)
        .stream()

        // Admins can see Employee invitations only.
        .filter(invitation -> inviter.getRole() == Role.COMPANY_OWNER
            || invitation.getInvitedRole() == Role.EMPLOYEE)

        .map(invitation -> toInvitationResponse(invitation, null))
        .collect(Collectors.toList());
  }

  // ==================== REVOKE INVITATION ====================

  @Override
  @Transactional
  public void revokeInvitation(
      Long invitationId,
      String authenticatedUserEmail) {

    User inviter = getAuthorizedInviter(authenticatedUserEmail);

    Long companyId = inviter.getCompany().getId();

    EmployeeInvitation invitation = invitationRepository
        .findByIdAndCompanyId(invitationId, companyId)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Invitation not found for this company"));

    if (invitation.getInvitationStatus() != EmployeeInvitationStatus.PENDING) {

      throw new ResponseStatusException(
          HttpStatus.CONFLICT,
          "Only pending invitations can be revoked");
    }

    // Admins cannot revoke Admin invitations.
    if (inviter.getRole() == Role.ADMIN
        && invitation.getInvitedRole() != Role.EMPLOYEE) {

      throw new ResponseStatusException(
          HttpStatus.FORBIDDEN,
          "Admins can revoke Employee invitations only");
    }

    invitation.setInvitationStatus(
        EmployeeInvitationStatus.REVOKED);

    invitationRepository.save(invitation);
  }

  // ==================== AUTHORIZATION ====================

  private User getAuthorizedInviter(String email) {

    User inviter = userRepository.findByEmail(email)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.UNAUTHORIZED,
            "Authenticated user not found"));

    if (inviter.getRole() != Role.COMPANY_OWNER
        && inviter.getRole() != Role.ADMIN) {

      throw new ResponseStatusException(
          HttpStatus.FORBIDDEN,
          "Only Company Owners and Admins can manage invitations");
    }

    if (inviter.getCompany() == null) {
      throw new ResponseStatusException(
          HttpStatus.FORBIDDEN,
          "User is not associated with a company");
    }

    return inviter;
  }

  // ==================== RESPONSE MAPPER ====================

  private EmployeeInvitationResponse toInvitationResponse(
      EmployeeInvitation invitation,
      String message) {

    return EmployeeInvitationResponse.builder()
        .id(invitation.getId())
        .companyId(invitation.getCompanyId())
        .invitedRole(invitation.getInvitedRole())
        .employmentCode(invitation.getEmploymentCode())
        .employeeName(invitation.getEmployeeName())
        .email(invitation.getEmail())
        .phone(invitation.getPhone())
        .department(invitation.getDepartment())
        .designation(invitation.getDesignation())
        .managerName(invitation.getManagerName())
        .dateOfJoining(invitation.getDateOfJoining())
        .invitationStatus(invitation.getInvitationStatus().name())
        .expiresAt(invitation.getExpiresAt())
        .createdAt(invitation.getCreatedAt())
        .message(message)
        .build();
  }

  // ==================== EMAIL TEMPLATE ====================

  private String buildInvitationEmail(
      String employeeName,
      String companyName,
      String invitationLink,
      String roleName) {

    return """
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
            <div style="max-width: 600px; margin: auto; padding: 25px;">
                <h2>%s Account Invitation</h2>

                <p>Hello %s,</p>

                <p>
                    You have been invited to join
                    <strong>%s</strong>
                    as a <strong>%s</strong>.
                </p>

                <p>
                    Click the button below to complete
                    your account registration.
                </p>

                <p style="margin: 30px 0;">
                    <a href="%s"
                       style="background-color: #2563eb;
                              color: white;
                              padding: 12px 24px;
                              text-decoration: none;
                              border-radius: 5px;">
                        Complete Registration
                    </a>
                </p>

                <p>This invitation expires in 48 hours.</p>

                <p>
                    If you were not expecting this invitation,
                    you can ignore this email.
                </p>

                <p>Regards,<br>%s Team</p>
            </div>
        </body>
        </html>
        """.formatted(
        escapeHtml(roleName),
        escapeHtml(employeeName),
        escapeHtml(companyName),
        escapeHtml(roleName),
        escapeHtml(invitationLink),
        escapeHtml(companyName));
  }

  // ==================== ROLE DISPLAY NAME ====================

  private String getRoleDisplayName(Role role) {

    if (role == Role.ADMIN) {
      return "Admin";
    }

    return "Employee";
  }

  // ==================== HTML ESCAPING ====================

  private String escapeHtml(String value) {

    if (value == null) {
      return "";
    }

    return value
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("\"", "&quot;")
        .replace("'", "&#39;");
  }
}
