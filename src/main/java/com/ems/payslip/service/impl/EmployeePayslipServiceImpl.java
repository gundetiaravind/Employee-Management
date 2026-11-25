package com.ems.payslip.service.impl;

import java.time.Month;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ems.common.enums.Role;
import com.ems.common.enums.UserStatus;
import com.ems.company.repository.CompanyUserRepository;
import com.ems.employee.entity.Employee;
import com.ems.employee.repository.EmployeeRepository;
import com.ems.payslip.dto.EmployeePayslipResponse;
import com.ems.payslip.entity.Payslip;
import com.ems.payslip.repository.EmployeePayslipRepository;
import com.ems.payslip.service.EmployeePayslipService;
import com.ems.user.entity.User;

@Service
@Transactional(readOnly = true)
public class EmployeePayslipServiceImpl implements EmployeePayslipService {

    private final EmployeePayslipRepository payslipRepository;
    private final EmployeeRepository employeeRepository;
    private final CompanyUserRepository userRepository;

    public EmployeePayslipServiceImpl(
            EmployeePayslipRepository payslipRepository,
            EmployeeRepository employeeRepository,
            CompanyUserRepository userRepository) {
        this.payslipRepository = payslipRepository;
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
    }

    @Override
    public EmployeePayslipResponse getPayslipById(
            Long payslipId, String email) {
        Employee employee = getAuthenticatedEmployee(email);

        Payslip payslip = payslipRepository
                .findByIdAndEmployee_IdAndCompany_Id(
                        payslipId, employee.getId(), employee.getCompanyId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Payslip not found."));

        return toResponse(payslip);
    }

    @Override
    public List<EmployeePayslipResponse> getMyPayslips(String email) {
        Employee employee = getAuthenticatedEmployee(email);

        return payslipRepository
                .findByEmployee_IdAndCompany_IdOrderByPayslipYearDescPayslipMonthDesc(
                        employee.getId(), employee.getCompanyId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private Employee getAuthenticatedEmployee(String email) {
        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Authenticated user was not found."));

        if (user.getAccountStatus() != UserStatus.ACTIVE) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Your account is not active.");
        }

        if (user.getRole() != Role.EMPLOYEE) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only employees can view their payslips.");
        }

        return employeeRepository
                .findByUser_Id(user.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Employee profile not found for this account."));
    }

    private EmployeePayslipResponse toResponse(Payslip payslip) {
        com.ems.company.entity.Employee employee = payslip.getEmployee();

        return EmployeePayslipResponse.builder()
                .id(payslip.getId())
                .employeeId(employee.getId())
                .employeeName(employee.getEmployeeName())
                .employeeCode(employee.getEmploymentCode())
                .payMonth(formatMonth(payslip.getPayslipMonth()))
                .payYear(payslip.getPayslipYear())
                .payDate(payslip.getPayDate())
                .basicSalary(payslip.getBasicSalary())
                .hra(payslip.getHra())
                .allowances(payslip.getAllowances())
                .bonus(payslip.getBonus())
                .providentFund(payslip.getProvidentFund())
                .tax(payslip.getTax())
                .otherDeductions(payslip.getOtherDeductions())
                .grossSalary(payslip.getGrossSalary())
                .totalDeductions(payslip.getTotalDeductions())
                .netSalary(payslip.getNetSalary())
                .status(payslip.getStatus())
                .build();
    }

    private String formatMonth(Integer month) {
        if (month == null || month < 1 || month > 12) {
            return "-";
        }

        return Month.of(month).getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
    }
}
