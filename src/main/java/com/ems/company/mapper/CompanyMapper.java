package com.ems.company.mapper;

import com.ems.common.enums.UserStatus;
import com.ems.company.dto.*;
import com.ems.company.entity.Company;
import com.ems.company.entity.Employee;
import com.ems.company.entity.EmployeeStatus;
import com.ems.user.entity.User;

import java.time.format.DateTimeFormatter;

public final class CompanyMapper {

  private static final DateTimeFormatter DATE_TIME = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
  private static final DateTimeFormatter DATE = DateTimeFormatter.ISO_LOCAL_DATE;

  private CompanyMapper() {}

  public static CompanyAdminResponse toAdminResponse(User user) {
    if (user == null) return null;
    CompanyAdminResponse r = new CompanyAdminResponse();
    r.setId(user.getId());
    //r.setCompanyId(user.getCompany() != null ?  user.getcompanyId() : null);
    r.setCompanyId(user.getCompany() != null ? user.getCompany().getId() : null);
    r.setName(user.getFullName());
    r.setEmail(user.getEmail());
    r.setPhone(user.getMobileNumber());
    r.setStatus(mapUserStatus(user.getAccountStatus()));
    r.setEmailVerified(user.isEmailVerified());
    r.setCreatedAt(user.getCreatedAt() != null ? user.getCreatedAt().format(DATE_TIME) : null);
    r.setUpdatedAt(user.getUpdatedAt() != null ? user.getUpdatedAt().format(DATE_TIME) : null);
    return r;
  }

  public static CompanyEmployeeResponse toEmployeeResponse(Employee e) {
    if (e == null) return null;
    CompanyEmployeeResponse r = new CompanyEmployeeResponse();
    r.setId(e.getId());
    r.setCompanyId(e.getCompanyId());
    r.setCode(e.getEmploymentCode());
    r.setName(e.getEmployeeName());
    r.setEmail(e.getCompanyEmail());
    r.setPhone(e.getPhone());
    r.setDepartment(e.getDepartment());
    r.setDesignation(e.getDesignation());
    r.setManager(e.getManagerName());
    r.setJoined(e.getDateOfJoining() != null ? e.getDateOfJoining().format(DATE) : null);
    r.setStatus(mapEmployeeStatus(e.getEmployeeStatus()));
    r.setCreatedAt(e.getCreatedAt() != null ? e.getCreatedAt().format(DATE_TIME) : null);
    r.setUpdatedAt(e.getUpdatedAt() != null ? e.getUpdatedAt().format(DATE_TIME) : null);
    return r;
  }

  public static CompanySettingsResponse toSettingsResponse(Company c) {
    if (c == null) return null;
    CompanySettingsResponse r = new CompanySettingsResponse();
    r.setId(c.getId());
    r.setCompanyName(c.getCompanyName());
    r.setCompanyEmail(c.getCompanyEmail());
    r.setContactNumber(c.getCompanyPhone());
    r.setAddress(c.getCompanyAddress());
    r.setWebsite(c.getCompanyWebsite());
    r.setCity(c.getCity());
    r.setState(c.getState());
    r.setCountry(c.getCountry());
    r.setPinCode(c.getPinCode());
    r.setIndustry(c.getIndustry());
    r.setCompanyType(c.getCompanyType());
    r.setRegistrationStatus(c.getCompanyStatus());
    r.setIsActive(c.getIsActive());
    return r;
  }

  public static CompanyOwnerProfileResponse toOwnerProfile(User user) {
    if (user == null) return null;
    CompanyOwnerProfileResponse r = new CompanyOwnerProfileResponse();
    r.setId(user.getId());
    r.setCompanyId(user.getCompany() != null ? user.getCompany().getId() : null);
    r.setName(user.getFullName());
    r.setEmail(user.getEmail());
    r.setPhone(user.getMobileNumber());
    r.setRole(user.getRole() != null ? user.getRole().name() : null);
    r.setAccountStatus(user.getAccountStatus() != null ? user.getAccountStatus().name() : null);
    r.setEmailVerified(user.isEmailVerified());
    r.setCreatedAt(user.getCreatedAt() != null ? user.getCreatedAt().format(DATE_TIME) : null);
    return r;
  }

  public static String mapUserStatus(UserStatus status) {
    if (status == null) return "Inactive";
    return switch (status) {
      case ACTIVE -> "Active";
      case INVITED -> "Invited";
      case PENDING_VERIFICATION -> "Pending";
      default -> "Inactive";
    };
  }

  public static UserStatus parseUserStatus(String status) {
    if (status == null || status.isBlank()) return UserStatus.INVITED;
    return switch (status.trim().toLowerCase()) {
      case "active" -> UserStatus.ACTIVE;
      case "inactive" -> UserStatus.INACTIVE;
      case "invited" -> UserStatus.INVITED;
      default -> throw new RuntimeException("Invalid status. Use Active, Inactive or Invited");
    };
  }

  public static String mapEmployeeStatus(EmployeeStatus status) {
    if (status == null) return "Inactive";
    return status == EmployeeStatus.ACTIVE ? "Active" : "Inactive";
  }

  public static EmployeeStatus parseEmployeeStatus(String status) {
    if (status == null || status.isBlank()) return EmployeeStatus.ACTIVE;
    return switch (status.trim().toLowerCase()) {
      case "active" -> EmployeeStatus.ACTIVE;
      case "inactive", "resigned" -> EmployeeStatus.INACTIVE;
      default -> throw new RuntimeException("Invalid employee status. Use Active or Inactive");
    };
  }
}
