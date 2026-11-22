
package com.ems.company.service;

import com.ems.common.enums.Role;
import com.ems.common.enums.UserStatus;
import com.ems.company.dto.*;
import com.ems.company.entity.Company;
import com.ems.company.entity.EmployeeStatus;
import com.ems.company.mapper.CompanyMapper;
import com.ems.company.repository.CompanyRepository;
import com.ems.company.repository.CompanyUserRepository;
import com.ems.company.service.CompanyService;
import com.ems.employee.entity.Employee;
import com.ems.employee.repository.EmployeeRepository;
import com.ems.user.entity.User;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CompanyServiceImpl implements CompanyService {

  private final CompanyRepository companyRepository;
  private final CompanyUserRepository companyUserRepository;
  private final EmployeeRepository employeeRepository;

  public CompanyServiceImpl(
      CompanyRepository companyRepository,
      CompanyUserRepository companyUserRepository,
      EmployeeRepository employeeRepository) {

    this.companyRepository = companyRepository;
    this.companyUserRepository = companyUserRepository;
    this.employeeRepository = employeeRepository;
  }

  // =========================================================
  // DASHBOARD
  // =========================================================

  @Override
  @Transactional(readOnly = true)
  public CompanyOwnerDashboardResponse getDashboard(Long companyId) {

    Long authorizedCompanyId = resolveAuthorizedCompanyId(companyId, Role.COMPANY_OWNER);

    Company company = requireCompany(authorizedCompanyId);

    CompanyOwnerDashboardResponse response = new CompanyOwnerDashboardResponse();

    response.setCompanyId(company.getId());
    response.setCompanyName(company.getCompanyName());
    response.setRegistrationStatus(company.getCompanyStatus());
    response.setIsActive(company.getIsActive());

    response.setTotalAdmins(
        companyUserRepository.countByCompany_IdAndRole(
            authorizedCompanyId, Role.ADMIN));

    response.setActiveAdmins(
        companyUserRepository.countByCompany_IdAndRoleAndAccountStatus(
            authorizedCompanyId, Role.ADMIN, UserStatus.ACTIVE));

    response.setInactiveAdmins(
        companyUserRepository.countByCompany_IdAndRoleAndAccountStatus(
            authorizedCompanyId, Role.ADMIN, UserStatus.INACTIVE));

    response.setInvitedAdmins(
        companyUserRepository.countByCompany_IdAndRoleAndAccountStatus(
            authorizedCompanyId, Role.ADMIN, UserStatus.INVITED));

    response.setTotalEmployees(
        employeeRepository.countByCompanyId(authorizedCompanyId));

    response.setActiveEmployees(
        employeeRepository.countByCompanyIdAndEmployeeStatus(
            authorizedCompanyId, EmployeeStatus.ACTIVE));

    LocalDate today = LocalDate.now();

    LocalDateTime thisMonthStart = today.withDayOfMonth(1).atStartOfDay();

    LocalDateTime nextMonthStart = today.withDayOfMonth(1).plusMonths(1).atStartOfDay();

    LocalDateTime lastMonthStart = today.withDayOfMonth(1).minusMonths(1).atStartOfDay();

    long addedThisMonth = employeeRepository.countByCompanyIdAndCreatedAtBetween(
        authorizedCompanyId,
        thisMonthStart,
        nextMonthStart);

    long addedLastMonth = employeeRepository.countByCompanyIdAndCreatedAtBetween(
        authorizedCompanyId,
        lastMonthStart,
        thisMonthStart);

    double growthPercent;

    if (addedLastMonth == 0) {
      growthPercent = addedThisMonth > 0 ? 100.0 : 0.0;
    } else {
      growthPercent = ((double) (addedThisMonth - addedLastMonth)
          / addedLastMonth) * 100.0;
    }

    growthPercent = Math.round(growthPercent * 10.0) / 10.0;

    response.setEmployeesAddedThisMonth(addedThisMonth);
    response.setEmployeesAddedLastMonth(addedLastMonth);
    response.setEmployeesGrowthPercent(growthPercent);

    response.setCompanyCode(company.getCompanyCode());

    response.setOrganizationStatus(
        Boolean.TRUE.equals(company.getIsActive())
            ? "Active"
            : "Inactive");

    response.setAccountType("Owner");

    response.setRecentAdmins(
        companyUserRepository
            .findByCompany_IdAndRole(
                authorizedCompanyId, Role.ADMIN)
            .stream()
            .sorted(
                Comparator.comparing(
                    User::getCreatedAt,
                    Comparator.nullsLast(
                        Comparator.reverseOrder())))
            .limit(5)
            .map(CompanyMapper::toAdminResponse)
            .collect(Collectors.toList()));

    return response;
  }

  // =========================================================
  // ADMIN MANAGEMENT - COMPANY OWNER ONLY
  // =========================================================

  @Override
  @Transactional
  public CompanyAdminResponse createAdmin(
      Long companyId,
      CompanyCreateAdminRequest request) {

    resolveAuthorizedCompanyId(companyId, Role.COMPANY_OWNER);

    throw new ResponseStatusException(
        HttpStatus.CONFLICT,
        "Direct Admin creation is disabled. Use the invitation endpoint instead.");
  }

  @Override
  @Transactional(readOnly = true)
  public List<CompanyAdminResponse> listAdmins(Long companyId) {

    Long authorizedCompanyId = resolveAuthorizedCompanyId(companyId, Role.COMPANY_OWNER);

    return companyUserRepository
        .findByCompany_IdAndRole(
            authorizedCompanyId, Role.ADMIN)
        .stream()
        .sorted(
            Comparator.comparing(
                User::getCreatedAt,
                Comparator.nullsLast(
                    Comparator.reverseOrder())))
        .map(CompanyMapper::toAdminResponse)
        .collect(Collectors.toList());
  }

  @Override
  @Transactional(readOnly = true)
  public CompanyAdminResponse getAdmin(
      Long companyId,
      Long adminId) {

    Long authorizedCompanyId = resolveAuthorizedCompanyId(companyId, Role.COMPANY_OWNER);

    User admin = companyUserRepository
        .findByIdAndCompany_IdAndRole(
            adminId, authorizedCompanyId, Role.ADMIN)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Admin not found with id: " + adminId
                + " for this company."));

    return CompanyMapper.toAdminResponse(admin);
  }

  @Override
  @Transactional
  public CompanyAdminResponse updateAdmin(
      Long companyId,
      Long adminId,
      CompanyUpdateAdminRequest request) {

    Long authorizedCompanyId = resolveAuthorizedCompanyId(companyId, Role.COMPANY_OWNER);

    requireApprovedCompany(authorizedCompanyId);

    User admin = companyUserRepository
        .findByIdAndCompany_IdAndRole(
            adminId, authorizedCompanyId, Role.ADMIN)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Admin not found with id: " + adminId
                + " for this company."));

    if (request.getName() != null
        && !request.getName().isBlank()) {

      admin.setFullName(request.getName().trim());
    }

    if (request.getEmail() != null
        && !request.getEmail().isBlank()) {

      String email = request.getEmail().trim().toLowerCase();

      if (!email.equalsIgnoreCase(admin.getEmail())
          && companyUserRepository.existsByEmail(email)) {

        throw new ResponseStatusException(
            HttpStatus.CONFLICT,
            "Email '" + email
                + "' is already taken. Please use a different email.");
      }

      admin.setEmail(email);
    }

    if (request.getPhone() != null) {
      admin.setMobileNumber(request.getPhone());
    }

    if (request.getStatus() != null
        && !request.getStatus().isBlank()) {

      UserStatus status = CompanyMapper.parseUserStatus(request.getStatus());

      admin.setAccountStatus(status);

      if (status == UserStatus.ACTIVE) {
        admin.setEmailVerified(true);
      }
    }

    return CompanyMapper.toAdminResponse(
        companyUserRepository.save(admin));
  }

  @Override
  @Transactional
  public void deleteAdmin(Long companyId, Long adminId) {

    Long authorizedCompanyId = resolveAuthorizedCompanyId(companyId, Role.COMPANY_OWNER);

    requireApprovedCompany(authorizedCompanyId);

    User admin = companyUserRepository
        .findByIdAndCompany_IdAndRole(
            adminId, authorizedCompanyId, Role.ADMIN)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Admin not found with id: " + adminId
                + " for this company."));

    if (admin.getAccountStatus() == UserStatus.INVITED) {
      companyUserRepository.delete(admin);
    } else {
      admin.setAccountStatus(UserStatus.INACTIVE);
      companyUserRepository.save(admin);
    }
  }

  // =========================================================
  // EMPLOYEE MANAGEMENT - OWNER AND ADMIN
  // =========================================================

  @Override
  @Transactional
  public CompanyEmployeeResponse createEmployee(
      Long companyId,
      CompanyCreateEmployeeRequest request) {

    resolveAuthorizedCompanyId(
        companyId, Role.COMPANY_OWNER, Role.ADMIN);

    throw new ResponseStatusException(
        HttpStatus.CONFLICT,
        "Direct Employee creation is disabled. Use the invitation endpoint instead.");
  }

  @Override
  @Transactional(readOnly = true)
  public List<CompanyEmployeeResponse> listEmployees(Long companyId) {

    Long authorizedCompanyId = resolveAuthorizedCompanyId(
        companyId, Role.COMPANY_OWNER, Role.ADMIN);

    return employeeRepository
        .findByCompanyIdOrderByCreatedAtDesc(authorizedCompanyId)
        .stream()
        .map(CompanyMapper::toEmployeeResponse)
        .collect(Collectors.toList());
  }

  @Override
  @Transactional(readOnly = true)
  public CompanyEmployeeResponse getEmployee(
      Long companyId,
      Long employeeId) {

    Long authorizedCompanyId = resolveAuthorizedCompanyId(
        companyId, Role.COMPANY_OWNER, Role.ADMIN);

    Employee employee = employeeRepository
        .findByIdAndCompanyId(employeeId, authorizedCompanyId)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Employee not found with id: " + employeeId
                + " for this company."));

    return CompanyMapper.toEmployeeResponse(employee);
  }

  @Override
  @Transactional
  public CompanyEmployeeResponse updateEmployee(
      Long companyId,
      Long employeeId,
      CompanyUpdateEmployeeRequest request) {

    Long authorizedCompanyId = resolveAuthorizedCompanyId(
        companyId, Role.COMPANY_OWNER, Role.ADMIN);

    requireApprovedCompany(authorizedCompanyId);

    Employee employee = employeeRepository
        .findByIdAndCompanyId(employeeId, authorizedCompanyId)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Employee not found with id: " + employeeId
                + " for this company."));

    if (request.getCode() != null
        && !request.getCode().isBlank()) {

      String code = request.getCode().trim();

      if (employeeRepository
          .existsByCompanyIdAndEmploymentCodeAndIdNot(
              authorizedCompanyId, code, employeeId)) {

        throw new ResponseStatusException(
            HttpStatus.CONFLICT,
            "Employment code '" + code
                + "' is already taken.");
      }

      employee.setEmploymentCode(code);
    }

    if (request.getName() != null
        && !request.getName().isBlank()) {

      employee.setEmployeeName(request.getName().trim());
    }

    if (request.getEmail() != null
        && !request.getEmail().isBlank()) {

      String email = request.getEmail().trim().toLowerCase();

      if (employeeRepository
          .existsByCompanyIdAndCompanyEmailAndIdNot(
              authorizedCompanyId, email, employeeId)) {

        throw new ResponseStatusException(
            HttpStatus.CONFLICT,
            "Email '" + email
                + "' is already taken.");
      }

      employee.setCompanyEmail(email);
    }

    if (request.getPhone() != null) {
      employee.setPhone(request.getPhone());
    }

    if (request.getDepartment() != null) {
      employee.setDepartment(request.getDepartment());
    }

    if (request.getDesignation() != null) {
      employee.setDesignation(request.getDesignation());
    }

    if (request.getManager() != null) {
      employee.setManagerName(request.getManager());
    }

    if (request.getJoined() != null
        && !request.getJoined().isBlank()) {

      employee.setDateOfJoining(
          LocalDate.parse(request.getJoined()));
    }

    if (request.getStatus() != null
        && !request.getStatus().isBlank()) {

      employee.setEmployeeStatus(
          CompanyMapper.parseEmployeeStatus(
              request.getStatus()));
    }

    return CompanyMapper.toEmployeeResponse(
        employeeRepository.save(employee));
  }

  @Override
  @Transactional
  public void deleteEmployee(Long companyId, Long employeeId) {

    Long authorizedCompanyId = resolveAuthorizedCompanyId(
        companyId, Role.COMPANY_OWNER, Role.ADMIN);

    requireApprovedCompany(authorizedCompanyId);

    Employee employee = employeeRepository
        .findByIdAndCompanyId(employeeId, authorizedCompanyId)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Employee not found with id: " + employeeId
                + " for this company."));

    employee.setEmployeeStatus(EmployeeStatus.INACTIVE);

    employeeRepository.save(employee);
  }

  // =========================================================
  // COMPANY SETTINGS - COMPANY OWNER ONLY
  // =========================================================

  @Override
  @Transactional(readOnly = true)
  public CompanySettingsResponse getCompanySettings(Long companyId) {

    Long authorizedCompanyId = resolveAuthorizedCompanyId(companyId, Role.COMPANY_OWNER);

    return CompanyMapper.toSettingsResponse(
        requireCompany(authorizedCompanyId));
  }

  @Override
  @Transactional
  public CompanySettingsResponse updateCompanySettings(
      Long companyId,
      CompanyUpdateSettingsRequest request) {

    Long authorizedCompanyId = resolveAuthorizedCompanyId(companyId, Role.COMPANY_OWNER);

    Company company = requireApprovedCompany(authorizedCompanyId);

    if (request.getCompanyName() != null
        && !request.getCompanyName().isBlank()) {

      company.setCompanyName(
          request.getCompanyName().trim());
    }

    if (request.getContactNumber() != null) {
      company.setCompanyPhone(request.getContactNumber());
    }

    if (request.getAddress() != null) {
      company.setCompanyAddress(request.getAddress());
    }

    if (request.getWebsite() != null) {
      company.setCompanyWebsite(request.getWebsite());
    }

    return CompanyMapper.toSettingsResponse(
        companyRepository.save(company));
  }

  // =========================================================
  // OWNER PROFILE - COMPANY OWNER ONLY
  // =========================================================

  @Override
  @Transactional(readOnly = true)
  public CompanyOwnerProfileResponse getOwnerProfile(Long companyId) {

    Long authorizedCompanyId = resolveAuthorizedCompanyId(companyId, Role.COMPANY_OWNER);

    User owner = companyUserRepository
        .findFirstByCompany_IdAndRole(
            authorizedCompanyId, Role.COMPANY_OWNER)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Company Owner not found for this company."));

    return CompanyMapper.toOwnerProfile(owner);
  }

  // =========================================================
  // AUTHORIZATION HELPERS
  // =========================================================

  /**
   * Gets the currently authenticated user and verifies:
   * 1. The user is authenticated.
   * 2. The user's account is active.
   * 3. The user's role is permitted.
   * 4. The requested company belongs to that user.
   *
   * The company ID from the frontend is never trusted on its own.
   */
  private Long resolveAuthorizedCompanyId(
      Long requestedCompanyId,
      Role... allowedRoles) {

    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null
        || !authentication.isAuthenticated()
        || authentication.getName() == null
        || "anonymousUser".equals(authentication.getName())) {

      throw new ResponseStatusException(
          HttpStatus.UNAUTHORIZED,
          "Authentication is required.");
    }

    String email = authentication.getName();

    User currentUser = companyUserRepository
        .findByEmail(email)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.UNAUTHORIZED,
            "Authenticated user was not found."));

    if (currentUser.getAccountStatus() != UserStatus.ACTIVE) {
      throw new ResponseStatusException(
          HttpStatus.FORBIDDEN,
          "Your account is not active.");
    }

    boolean roleAllowed = false;

    for (Role allowedRole : allowedRoles) {
      if (currentUser.getRole() == allowedRole) {
        roleAllowed = true;
        break;
      }
    }

    if (!roleAllowed) {
      throw new ResponseStatusException(
          HttpStatus.FORBIDDEN,
          "You do not have permission to perform this operation.");
    }

    if (currentUser.getCompany() == null
        || currentUser.getCompany().getId() == null) {

      throw new ResponseStatusException(
          HttpStatus.FORBIDDEN,
          "Your account is not associated with a company.");
    }

    Long authenticatedCompanyId = currentUser.getCompany().getId();

    if (requestedCompanyId != null
        && !authenticatedCompanyId.equals(requestedCompanyId)) {

      throw new ResponseStatusException(
          HttpStatus.FORBIDDEN,
          "You cannot access another company's data.");
    }

    return authenticatedCompanyId;
  }

  // =========================================================
  // COMPANY HELPERS
  // =========================================================

  private Company requireCompany(Long companyId) {

    return companyRepository.findById(companyId)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Company not found with id: " + companyId));
  }

  private Company requireApprovedCompany(Long companyId) {

    Company company = requireCompany(companyId);

    if (!"APPROVED".equalsIgnoreCase(
        company.getCompanyStatus())) {

      throw new ResponseStatusException(
          HttpStatus.CONFLICT,
          "Company must be APPROVED. Current status: "
              + company.getCompanyStatus());
    }

    return company;
  }
}
