
package com.ems.payslip.service.impl;

import com.ems.common.enums.Role;
import com.ems.company.entity.Company;
import com.ems.company.entity.Employee;
import com.ems.company.repository.EmployeeRepository;
import com.ems.payslip.dto.PayslipRequest;
import com.ems.payslip.dto.PayslipResponse;
import com.ems.payslip.entity.Payslip;
import com.ems.payslip.repository.PayslipRepository;
import com.ems.payslip.service.PayslipService;
import com.ems.payslip.storage.PayslipStorageService;
import com.ems.user.entity.User;
import com.ems.user.repository.UserRepository;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.YearMonth;
import java.util.List;

@Service
public class PayslipImpl implements PayslipService {

    private final PayslipRepository payslipRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final PayslipStorageService storageService;

    public PayslipImpl(
            PayslipRepository payslipRepository,
            @Qualifier("companyEmployeeRepository")
            EmployeeRepository employeeRepository,
            UserRepository userRepository,
            PayslipStorageService storageService) {

        this.payslipRepository = payslipRepository;
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
        this.storageService = storageService;
    }

    // Admin: Upload payslip
    @Override
    @Transactional(rollbackFor = Exception.class)
    public PayslipResponse uploadPayslip(
            Long employeeId,
            PayslipRequest request,
            MultipartFile file,
            String loggedInEmail) throws IOException {

        User admin = getLoggedInUser(loggedInEmail);

        requireRole(admin, Role.ADMIN);

        Company company = getCompany(admin);

        Employee employee = employeeRepository
                .findByIdAndCompanyId(employeeId, company.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Employee not found in your company"));

        boolean alreadyExists =
                payslipRepository
                        .existsByEmployee_IdAndPayslipMonthAndPayslipYear(
                                employeeId,
                                request.getPayslipMonth(),
                                request.getPayslipYear());

        if (alreadyExists) {
            throw new IllegalStateException(
                    "Payslip already exists for this employee and month");
        }

        String fileReference = storageService.store(file);

        try {
            Payslip payslip = new Payslip();

            payslip.setEmployee(employee);
            payslip.setCompany(company);
            payslip.setPayslipMonth(request.getPayslipMonth());
            payslip.setPayslipYear(request.getPayslipYear());
            payslip.setFileStorageReference(fileReference);
            payslip.setUploadedBy(admin);

            Payslip savedPayslip = payslipRepository.save(payslip);

            return toResponse(savedPayslip);

        } catch (RuntimeException exception) {
            storageService.delete(fileReference);
            throw exception;
        }
    }

    // Admin: View employee payslips
    @Override
    @Transactional(readOnly = true)
    public List<PayslipResponse> getEmployeePayslips(
            Long employeeId,
            String loggedInEmail) {

        User admin = getLoggedInUser(loggedInEmail);

        requireRole(admin, Role.ADMIN);

        Company company = getCompany(admin);

        employeeRepository
                .findByIdAndCompanyId(employeeId, company.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Employee not found in your company"));

        return payslipRepository
                .findByEmployee_IdAndCompany_IdOrderByPayslipYearDescPayslipMonthDesc(
                        employeeId, company.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // Employee: View own payslips from the last six months
    @Override
    @Transactional(readOnly = true)
    public List<PayslipResponse> getMyPayslips(String loggedInEmail) {

        User employeeUser = getLoggedInUser(loggedInEmail);

        requireRole(employeeUser, Role.EMPLOYEE);

        Company company = getCompany(employeeUser);

        List<Employee> companyEmployees =
                employeeRepository.findByCompanyIdOrderByCreatedAtDesc(
                        company.getId());

        Employee employee = companyEmployees.stream()
                .filter(item ->
                        item.getCompanyEmail() != null
                        && item.getCompanyEmail().equalsIgnoreCase(
                                employeeUser.getEmail()))
                .findFirst()
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Employee record not found for this login account"));

        YearMonth currentMonth = YearMonth.now();
        YearMonth firstAllowedMonth = currentMonth.minusMonths(5);

        return payslipRepository
                .findByEmployee_IdAndCompany_IdOrderByPayslipYearDescPayslipMonthDesc(
                        employee.getId(), company.getId())
                .stream()
                .filter(payslip -> {
                    YearMonth month = YearMonth.of(
                            payslip.getPayslipYear(),
                            payslip.getPayslipMonth());

                    return !month.isBefore(firstAllowedMonth)
                            && !month.isAfter(currentMonth);
                })
                .map(this::toResponse)
                .toList();
    }

    // Admin or employee: Download authorized payslip
    @Override
    @Transactional(readOnly = true)
    public byte[] downloadPayslip(
            Long payslipId,
            String loggedInEmail) throws IOException {

        User user = getLoggedInUser(loggedInEmail);

        Payslip payslip = payslipRepository.findById(payslipId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Payslip not found"));

        verifyPayslipAccess(user, payslip);

        return storageService.load(
                payslip.getFileStorageReference());
    }

    // Admin: Delete payslip
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deletePayslip(
            Long payslipId,
            String loggedInEmail) throws IOException {

        User admin = getLoggedInUser(loggedInEmail);

        requireRole(admin, Role.ADMIN);

        Company company = getCompany(admin);

        Payslip payslip = payslipRepository
                .findByIdAndCompany_Id(payslipId, company.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Payslip not found in your company"));

        storageService.delete(
                payslip.getFileStorageReference());

        payslipRepository.delete(payslip);
    }

    // Find logged-in user and print debug details
    private User getLoggedInUser(String email) {

        System.out.println("========== PAYSLIP DEBUG ==========");
        System.out.println("Authenticated email received: " + email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Logged-in user not found"));

        System.out.println("Database user email: " + user.getEmail());
        System.out.println("Database user role: " + user.getRole());

        System.out.println("Database company ID: " +
                (user.getCompany() != null
                        ? user.getCompany().getId()
                        : null));

        System.out.println("===================================");

        return user;
    }

    // Get user's company
    private Company getCompany(User user) {

        if (user.getCompany() == null ||
                user.getCompany().getId() == null) {

            throw new IllegalStateException(
                    "User is not associated with a company");
        }

        return user.getCompany();
    }

    // Check user role and print expected vs actual
    private void requireRole(User user, Role requiredRole) {

        System.out.println("========== ROLE CHECK ==========");
        System.out.println("Actual role: " + user.getRole());
        System.out.println("Required role: " + requiredRole);

        if (user.getRole() != requiredRole) {

            System.out.println("ROLE CHECK FAILED");

            throw new IllegalArgumentException(
                    "You are not authorized to perform this action");
        }

        System.out.println("ROLE CHECK PASSED");
        System.out.println("================================");
    }

    // Verify payslip ownership and company access
    private void verifyPayslipAccess(
            User user,
            Payslip payslip) {

        Company userCompany = getCompany(user);

        if (payslip.getCompany() == null ||
                !userCompany.getId().equals(
                        payslip.getCompany().getId())) {

            throw new IllegalArgumentException(
                    "You are not authorized to access this payslip");
        }

        if (user.getRole() == Role.EMPLOYEE) {

            String employeeEmail =
                    payslip.getEmployee().getCompanyEmail();

            if (employeeEmail == null ||
                    !employeeEmail.equalsIgnoreCase(user.getEmail())) {

                throw new IllegalArgumentException(
                        "You can access only your own payslips");
            }

        } else if (user.getRole() != Role.ADMIN) {

            throw new IllegalArgumentException(
                    "You are not authorized to download payslips");
        }
    }

    // Convert entity into response DTO
    private PayslipResponse toResponse(Payslip payslip) {

        PayslipResponse response = new PayslipResponse();

        response.setId(payslip.getId());
        response.setEmployeeId(payslip.getEmployee().getId());
        response.setEmployeeName(
                payslip.getEmployee().getEmployeeName());
        response.setPayslipMonth(payslip.getPayslipMonth());
        response.setPayslipYear(payslip.getPayslipYear());
        response.setUploadDate(payslip.getUploadDate());
        response.setUploadedBy(
                payslip.getUploadedBy().getFullName());

        return response;
    }
}
