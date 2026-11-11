package com.ems.company.service;

import com.ems.company.dto.*;

import java.util.List;

public interface CompanyService {

  CompanyOwnerDashboardResponse getDashboard(Long companyId);

  CompanyAdminResponse createAdmin(Long companyId, CompanyCreateAdminRequest request);

  List<CompanyAdminResponse> listAdmins(Long companyId);

  CompanyAdminResponse getAdmin(Long companyId, Long adminId);

  CompanyAdminResponse updateAdmin(Long companyId, Long adminId, CompanyUpdateAdminRequest request);

  void deleteAdmin(Long companyId, Long adminId);

  CompanyEmployeeResponse createEmployee(Long companyId, CompanyCreateEmployeeRequest request);

  List<CompanyEmployeeResponse> listEmployees(Long companyId);

  CompanyEmployeeResponse getEmployee(Long companyId, Long employeeId);

  CompanyEmployeeResponse updateEmployee(Long companyId, Long employeeId, CompanyUpdateEmployeeRequest request);

  void deleteEmployee(Long companyId, Long employeeId);

  CompanySettingsResponse getCompanySettings(Long companyId);

  CompanySettingsResponse updateCompanySettings(Long companyId, CompanyUpdateSettingsRequest request);

  CompanyOwnerProfileResponse getOwnerProfile(Long companyId);
}
