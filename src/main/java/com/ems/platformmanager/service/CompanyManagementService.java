package com.ems.platformmanager.service;

import java.util.List;

import com.ems.platformmanager.dto.CompanyManagementResponse;

public interface CompanyManagementService {

    List<CompanyManagementResponse> getAllCompanies(String status);

    CompanyManagementResponse approveCompany(Long companyId);

    CompanyManagementResponse rejectCompany(Long companyId);
}