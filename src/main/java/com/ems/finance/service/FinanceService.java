package com.ems.finance.service;

import com.ems.finance.dto.FinanceRequest;
import com.ems.finance.dto.FinanceResponse;
import com.ems.finance.dto.CtcRequest;
import com.ems.finance.dto.CtcResponse;

public interface FinanceService {

    // Get employee finance details
    FinanceResponse getFinanceDetails(
            Long employeeId, Long tenantId);

    // Update employee finance details
    FinanceResponse updateFinanceDetails(
            Long employeeId, Long tenantId,
            FinanceRequest request);

    // Get employee CTC breakup
    CtcResponse getCtcDetails(
            Long employeeId, Long tenantId);

    // Update employee CTC breakup
    CtcResponse updateCtcDetails(
            Long employeeId, Long tenantId,
            CtcRequest request);
}