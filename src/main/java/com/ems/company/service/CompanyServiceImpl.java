package com.ems.company.service;

import com.ems.common.enums.Role;
import com.ems.common.enums.UserStatus;
import com.ems.company.dto.*;
import com.ems.company.entity.Company;
import com.ems.company.entity.Employee;
import com.ems.company.entity.EmployeeStatus;
import com.ems.company.mapper.CompanyMapper;
import com.ems.company.repository.CompanyRepository;
import com.ems.company.repository.CompanyUserRepository;
import com.ems.company.repository.EmployeeRepository;
import com.ems.user.entity.User;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class CompanyServiceImpl implements CompanyService {

  private final CompanyRepository companyRepository;
  private final CompanyUserRepository companyUserRepository;
  private final EmployeeRepository employeeRepository;
  private final PasswordEncoder passwordEncoder;

  public CompanyServiceImpl(
      CompanyRepository companyRepository,
      CompanyUserRepository companyUserRepository,
      EmployeeRepository employeeRepository,
      PasswordEncoder passwordEncoder) {
    this.companyRepository = companyRepository;
    this.companyUserRepository = companyUserRepository;
    this.employeeRepository = employeeRepository;
    this.passwordEncoder = passwordEncoder;
  }

  @Override
  @Transactional(readOnly = true)
  public CompanyOwnerDashboardResponse getDashboard(Long companyId) {
    Company company = requireCompany(companyId);
    CompanyOwnerDashboardResponse response = new CompanyOwnerDashboardResponse();
    response.setCompanyId(company.getId());
    response.setCompanyName(company.getCompanyName());
    response.setRegistrationStatus(company.getCompanyStatus());
    response.setIsActive(company.getIsActive());
    response.setTotalAdmins(companyUserRepository.countByCompany_IdAndRole(companyId, Role.ADMIN));
    response.setActiveAdmins(companyUserRepository.countByCompany_IdAndRoleAndAccountStatus(companyId, Role.ADMIN, UserStatus.ACTIVE));
    response.setInactiveAdmins(companyUserRepository.countByCompany_IdAndRoleAndAccountStatus(companyId, Role.ADMIN, UserStatus.INACTIVE));
    response.setInvitedAdmins(companyUserRepository.countByCompany_IdAndRoleAndAccountStatus(companyId, Role.ADMIN, UserStatus.INVITED));
    response.setTotalEmployees(employeeRepository.countByCompanyId(companyId));
    response.setActiveEmployees(employeeRepository.countByCompanyIdAndEmployeeStatus(companyId, EmployeeStatus.ACTIVE));
    // ===== COMPANY GROWTH (paste block starts here) =====
    LocalDate today = LocalDate.now();
    LocalDateTime thisMonthStart = today.withDayOfMonth(1).atStartOfDay();
    LocalDateTime nextMonthStart = today.withDayOfMonth(1).plusMonths(1).atStartOfDay();
    LocalDateTime lastMonthStart = today.withDayOfMonth(1).minusMonths(1).atStartOfDay();

    long addedThisMonth = employeeRepository.countByCompanyIdAndCreatedAtBetween(
        companyId, thisMonthStart, nextMonthStart);

    long addedLastMonth = employeeRepository.countByCompanyIdAndCreatedAtBetween(
        companyId, lastMonthStart, thisMonthStart);

    double growthPercent;
    if (addedLastMonth == 0) {
      growthPercent = addedThisMonth > 0 ? 100.0 : 0.0;
    } else {
      growthPercent = ((double) (addedThisMonth - addedLastMonth) / addedLastMonth) * 100.0;
    }
    growthPercent = Math.round(growthPercent * 10.0) / 10.0;

    response.setEmployeesAddedThisMonth(addedThisMonth);
    response.setEmployeesAddedLastMonth(addedLastMonth);
    response.setEmployeesGrowthPercent(growthPercent);
    response.setCompanyCode(company.getCompanyCode());
    response.setOrganizationStatus(
        Boolean.TRUE.equals(company.getIsActive()) ? "Active" : "Inactive");
    response.setAccountType("Owner");
    // ===== COMPANY GROWTH (paste block ends here) =====
    response.setRecentAdmins(
        companyUserRepository.findByCompany_IdAndRole(companyId, Role.ADMIN).stream()
            .sorted(Comparator.comparing(User::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
            .limit(5)
            .map(CompanyMapper::toAdminResponse)
            .collect(Collectors.toList()));
    return response;
  }

  @Override
  @Transactional
  public CompanyAdminResponse createAdmin(Long companyId, CompanyCreateAdminRequest request) {
    Company company = requireApprovedCompany(companyId);
    String name = request.getName() != null ? request.getName().trim() : "";
    String email = request.getEmail().trim().toLowerCase();
    if (name.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name is required");
    }
    if (email.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
    }
    if (companyUserRepository.existsByEmail(email)) {
      throw new ResponseStatusException(HttpStatus.CONFLICT,
          "Email '" + email + "' is already taken. Please use a different email.");
    }
    UserStatus status = request.getStatus() != null && !request.getStatus().isBlank()
        ? CompanyMapper.parseUserStatus(request.getStatus())
        : UserStatus.INVITED;

    User admin = new User();
    admin.setFullName(name);
    admin.setEmail(email);
    admin.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
    admin.setRole(Role.ADMIN);
    admin.setAccountStatus(status);
    admin.setEmailVerified(status == UserStatus.ACTIVE);
    admin.setMobileNumber(request.getPhone());
    admin.setCompany(company);
    return CompanyMapper.toAdminResponse(companyUserRepository.save(admin));
  }

  @Override
  @Transactional(readOnly = true)
  public List<CompanyAdminResponse> listAdmins(Long companyId) {
    requireCompany(companyId);
    return companyUserRepository.findByCompany_IdAndRole(companyId, Role.ADMIN).stream()
        .sorted(Comparator.comparing(User::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
        .map(CompanyMapper::toAdminResponse)
        .collect(Collectors.toList());
  }

  @Override
  @Transactional(readOnly = true)
  public CompanyAdminResponse getAdmin(Long companyId, Long adminId) {
    User admin = companyUserRepository.findByIdAndCompany_IdAndRole(adminId, companyId, Role.ADMIN)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Admin not found with id: " + adminId + " for this company. First POST create admin or GET list admins."));
    return CompanyMapper.toAdminResponse(admin);
  }

  @Override
  @Transactional
  public CompanyAdminResponse updateAdmin(Long companyId, Long adminId, CompanyUpdateAdminRequest request) {
    requireApprovedCompany(companyId);
    User admin = companyUserRepository.findByIdAndCompany_IdAndRole(adminId, companyId, Role.ADMIN)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Admin not found with id: " + adminId + " for this company. First POST create admin or GET list admins."));

    if (request.getName() != null && !request.getName().isBlank()) admin.setFullName(request.getName().trim());
    if (request.getEmail() != null && !request.getEmail().isBlank()) {
      String email = request.getEmail().trim().toLowerCase();
      if (!email.equalsIgnoreCase(admin.getEmail()) && companyUserRepository.existsByEmail(email)) {
        throw new ResponseStatusException(HttpStatus.CONFLICT,
            "Email '" + email + "' is already taken. Please use a different email.");
      }
      admin.setEmail(email);
    }
    if (request.getPhone() != null) admin.setMobileNumber(request.getPhone());
    if (request.getStatus() != null && !request.getStatus().isBlank()) {
      UserStatus status = CompanyMapper.parseUserStatus(request.getStatus());
      admin.setAccountStatus(status);
      if (status == UserStatus.ACTIVE) admin.setEmailVerified(true);
    }
    return CompanyMapper.toAdminResponse(companyUserRepository.save(admin));
  }

  @Override
  @Transactional
  public void deleteAdmin(Long companyId, Long adminId) {
    requireApprovedCompany(companyId);
    User admin = companyUserRepository.findByIdAndCompany_IdAndRole(adminId, companyId, Role.ADMIN)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Admin not found with id: " + adminId + " for this company. First POST create admin or GET list admins."));
    if (admin.getAccountStatus() == UserStatus.INVITED) {
      companyUserRepository.delete(admin);
    } else {
      admin.setAccountStatus(UserStatus.INACTIVE);
      companyUserRepository.save(admin);
    }
  }

  @Override
  @Transactional
  public CompanyEmployeeResponse createEmployee(Long companyId, CompanyCreateEmployeeRequest request) {
    requireApprovedCompany(companyId);
    String code = request.getCode() != null ? request.getCode().trim() : "";
    String name = request.getName() != null ? request.getName().trim() : "";
    String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";

    if (code.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Employment code is required");
    }
    if (name.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Employee name is required");
    }
    if (email.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
    }

    boolean codeTaken = employeeRepository.existsByCompanyIdAndEmploymentCode(companyId, code);
    boolean emailTaken = employeeRepository.existsByCompanyIdAndCompanyEmail(companyId, email);
    if (codeTaken && emailTaken) {
      throw new ResponseStatusException(HttpStatus.CONFLICT,
          "Employment code '" + code + "' and email '" + email + "' are already taken. Please use different values.");
    }
    if (codeTaken) {
      throw new ResponseStatusException(HttpStatus.CONFLICT,
          "Employment code '" + code + "' is already taken. Please use a different code.");
    }
    if (emailTaken) {
      throw new ResponseStatusException(HttpStatus.CONFLICT,
          "Email '" + email + "' is already taken. Please use a different email.");
    }
    Employee employee = new Employee();
    employee.setCompanyId(companyId);
    employee.setEmploymentCode(code);
    employee.setEmployeeName(name);
    employee.setCompanyEmail(email);
    employee.setPhone(request.getPhone());
    employee.setDepartment(request.getDepartment());
    employee.setDesignation(request.getDesignation());
    employee.setManagerName(request.getManager());
    if (request.getJoined() != null && !request.getJoined().isBlank()) {
      employee.setDateOfJoining(LocalDate.parse(request.getJoined()));
    }
    employee.setEmployeeStatus(CompanyMapper.parseEmployeeStatus(request.getStatus()));
    return CompanyMapper.toEmployeeResponse(employeeRepository.save(employee));
  }

  @Override
  @Transactional(readOnly = true)
  public List<CompanyEmployeeResponse> listEmployees(Long companyId) {
    requireCompany(companyId);
    return employeeRepository.findByCompanyIdOrderByCreatedAtDesc(companyId).stream()
        .map(CompanyMapper::toEmployeeResponse)
        .collect(Collectors.toList());
  }

  @Override
  @Transactional(readOnly = true)
  public CompanyEmployeeResponse getEmployee(Long companyId, Long employeeId) {
    Employee employee = employeeRepository.findByIdAndCompanyId(employeeId, companyId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found with id: " + employeeId + " for this company. First POST create employee or GET list employees."));
    return CompanyMapper.toEmployeeResponse(employee);
  }

  @Override
  @Transactional
  public CompanyEmployeeResponse updateEmployee(Long companyId, Long employeeId, CompanyUpdateEmployeeRequest request) {
    requireApprovedCompany(companyId);
    Employee employee = employeeRepository.findByIdAndCompanyId(employeeId, companyId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found with id: " + employeeId + " for this company. First POST create employee or GET list employees."));

    if (request.getCode() != null && !request.getCode().isBlank()) {
      String code = request.getCode().trim();
      if (employeeRepository.existsByCompanyIdAndEmploymentCodeAndIdNot(companyId, code, employeeId)) {
        throw new ResponseStatusException(HttpStatus.CONFLICT,
            "Employment code '" + code + "' is already taken. Please use a different code.");
      }
      employee.setEmploymentCode(code);
    }
    if (request.getName() != null && !request.getName().isBlank()) employee.setEmployeeName(request.getName().trim());
    if (request.getEmail() != null && !request.getEmail().isBlank()) {
      String email = request.getEmail().trim().toLowerCase();
      if (employeeRepository.existsByCompanyIdAndCompanyEmailAndIdNot(companyId, email, employeeId)) {
        throw new ResponseStatusException(HttpStatus.CONFLICT,
            "Email '" + email + "' is already taken. Please use a different email.");
      }
      employee.setCompanyEmail(email);
    }
    if (request.getPhone() != null) employee.setPhone(request.getPhone());
    if (request.getDepartment() != null) employee.setDepartment(request.getDepartment());
    if (request.getDesignation() != null) employee.setDesignation(request.getDesignation());
    if (request.getManager() != null) employee.setManagerName(request.getManager());
    if (request.getJoined() != null && !request.getJoined().isBlank()) {
      employee.setDateOfJoining(LocalDate.parse(request.getJoined()));
    }
    if (request.getStatus() != null && !request.getStatus().isBlank()) {
      employee.setEmployeeStatus(CompanyMapper.parseEmployeeStatus(request.getStatus()));
    }
    return CompanyMapper.toEmployeeResponse(employeeRepository.save(employee));
  }

  @Override
  @Transactional
  public void deleteEmployee(Long companyId, Long employeeId) {
    requireApprovedCompany(companyId);
    Employee employee = employeeRepository.findByIdAndCompanyId(employeeId, companyId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found with id: " + employeeId + " for this company. First POST create employee or GET list employees."));
    employee.setEmployeeStatus(EmployeeStatus.INACTIVE);
    employeeRepository.save(employee);
  }

  @Override
  @Transactional(readOnly = true)
  public CompanySettingsResponse getCompanySettings(Long companyId) {
    return CompanyMapper.toSettingsResponse(requireCompany(companyId));
  }

  @Override
  @Transactional
  public CompanySettingsResponse updateCompanySettings(Long companyId, CompanyUpdateSettingsRequest request) {
    Company company = requireApprovedCompany(companyId);
    if (request.getCompanyName() != null && !request.getCompanyName().isBlank()) {
      company.setCompanyName(request.getCompanyName().trim());
    }
    if (request.getContactNumber() != null) company.setCompanyPhone(request.getContactNumber());
    if (request.getAddress() != null) company.setCompanyAddress(request.getAddress());
    if (request.getWebsite() != null) company.setCompanyWebsite(request.getWebsite());
    return CompanyMapper.toSettingsResponse(companyRepository.save(company));
  }

  @Override
  @Transactional(readOnly = true)
  public CompanyOwnerProfileResponse getOwnerProfile(Long companyId) {
    requireCompany(companyId);
    User owner = companyUserRepository.findFirstByCompany_IdAndRole(companyId, Role.COMPANY_OWNER)
        .orElseThrow(() -> new RuntimeException("Company Owner not found for companyId: " + companyId));
    return CompanyMapper.toOwnerProfile(owner);
  }

  private Company requireCompany(Long companyId) {
    return companyRepository.findById(companyId)
        .orElseThrow(() -> new RuntimeException("Company not found with id: " + companyId));
  }

  private Company requireApprovedCompany(Long companyId) {
    Company company = requireCompany(companyId);
    if (!"APPROVED".equalsIgnoreCase(company.getCompanyStatus())) {
      throw new ResponseStatusException(HttpStatus.CONFLICT,
            "Company must be APPROVED. Current status: " + company.getCompanyStatus());
    }
    return company;
  }
}
