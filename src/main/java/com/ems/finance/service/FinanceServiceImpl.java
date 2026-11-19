
package com.ems.finance.service;

import java.math.BigDecimal;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ems.company.repository.EmployeeRepository;
import com.ems.finance.dto.FinanceRequest;
import com.ems.finance.dto.FinanceResponse;
import com.ems.finance.dto.CtcRequest;
import com.ems.finance.dto.CtcResponse;
import com.ems.finance.entity.EmployeeFinance;
import com.ems.finance.entity.EmployeeCtc;
import com.ems.finance.mapper.FinanceMapper;
import com.ems.finance.repository.FinanceRepository;
import com.ems.finance.repository.CtcRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
@Transactional
public class FinanceServiceImpl implements FinanceService {

    private final FinanceRepository financeRepository;
    private final CtcRepository ctcRepository;
    private final FinanceMapper financeMapper;
    private final EmployeeRepository employeeRepository;

    public FinanceServiceImpl(
            FinanceRepository financeRepository,
            CtcRepository ctcRepository,
            FinanceMapper financeMapper,
            EmployeeRepository employeeRepository) {

        this.financeRepository = financeRepository;
        this.ctcRepository = ctcRepository;
        this.financeMapper = financeMapper;
        this.employeeRepository = employeeRepository;
    }

    // Validate that employee belongs to the authenticated user's company
    private void validateEmployeeOwnership(Long employeeId, Long tenantId) {

        employeeRepository.findByIdAndCompanyId(employeeId, tenantId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Employee not found in your company. Employee ID: "
                                + employeeId));
    }

    // Get employee finance details
    @Override
    @Transactional(readOnly = true)
    public FinanceResponse getFinanceDetails(Long employeeId, Long tenantId) {

        validateEmployeeOwnership(employeeId, tenantId);

        EmployeeFinance finance = financeRepository
                .findByEmployeeIdAndTenantId(employeeId, tenantId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Finance details not found for employee ID: "
                                + employeeId));

        return financeMapper.toFinanceResponse(finance);
    }

    // Create or update employee finance details
    @Override
    public FinanceResponse updateFinanceDetails(
            Long employeeId, Long tenantId, FinanceRequest request) {

        validateEmployeeOwnership(employeeId, tenantId);

        EmployeeFinance finance = financeRepository
                .findByEmployeeIdAndTenantId(employeeId, tenantId)
                .orElseGet(EmployeeFinance::new);

        finance.setEmployeeId(employeeId);
        finance.setTenantId(tenantId);
        finance.setPanNumber(request.getPanNumber());
        finance.setAadhaarNumber(request.getAadhaarNumber());
        finance.setBankName(request.getBankName());
        finance.setBranchName(request.getBranchName());
        finance.setIfscCode(request.getIfscCode());

        EmployeeFinance savedFinance = financeRepository.save(finance);

        return financeMapper.toFinanceResponse(savedFinance);
    }

    // Get employee CTC details
    @Override
    @Transactional(readOnly = true)
    public CtcResponse getCtcDetails(Long employeeId, Long tenantId) {

        validateEmployeeOwnership(employeeId, tenantId);

        EmployeeCtc ctc = ctcRepository
                .findByEmployeeIdAndTenantId(employeeId, tenantId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "CTC details not found for employee ID: "
                                + employeeId));

        return financeMapper.toCtcResponse(ctc);
    }

    // Create or update employee CTC details
    @Override
    public CtcResponse updateCtcDetails(
            Long employeeId, Long tenantId, CtcRequest request) {

        validateEmployeeOwnership(employeeId, tenantId);

        // Calculate total of all salary components
        BigDecimal componentTotal = request.getBasicSalary()
                .add(request.getHra())
                .add(request.getSpecialAllowance())
                .add(request.getOtherAllowances());

        // Ensure salary components do not exceed annual CTC
        if (componentTotal.compareTo(request.getTotalAnnualCtc()) > 0) {
            throw new IllegalArgumentException(
                    "Total salary components cannot exceed annual CTC");
        }

        EmployeeCtc ctc = ctcRepository
                .findByEmployeeIdAndTenantId(employeeId, tenantId)
                .orElseGet(EmployeeCtc::new);

        ctc.setEmployeeId(employeeId);
        ctc.setTenantId(tenantId);
        ctc.setTotalAnnualCtc(request.getTotalAnnualCtc());
        ctc.setBasicSalary(request.getBasicSalary());
        ctc.setHra(request.getHra());
        ctc.setSpecialAllowance(request.getSpecialAllowance());
        ctc.setOtherAllowances(request.getOtherAllowances());

        EmployeeCtc savedCtc = ctcRepository.save(ctc);

        return financeMapper.toCtcResponse(savedCtc);
    }
}
