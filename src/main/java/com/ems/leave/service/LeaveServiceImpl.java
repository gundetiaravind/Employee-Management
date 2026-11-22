
package com.ems.leave.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ems.company.entity.Company;
import com.ems.company.repository.CompanyUserRepository;
import com.ems.common.enums.UserStatus;
import com.ems.employee.entity.Employee;
import com.ems.employee.repository.EmployeeRepository;
import com.ems.leave.dto.LeaveDecisionRequest;
import com.ems.leave.dto.LeaveResponse;
import com.ems.leave.entity.LeaveRequest;
import com.ems.leave.mapper.LeaveMapper;
import com.ems.leave.repository.LeaveRepository;
import com.ems.user.entity.User;

@Service
@Transactional
public class LeaveServiceImpl implements LeaveService {

    private final LeaveRepository leaveRepository;
    private final EmployeeRepository employeeRepository;
    private final CompanyUserRepository companyUserRepository;
    private final LeaveMapper leaveMapper;

    public LeaveServiceImpl(
            LeaveRepository leaveRepository,
            EmployeeRepository employeeRepository,
            CompanyUserRepository companyUserRepository,
            LeaveMapper leaveMapper) {

        this.leaveRepository = leaveRepository;
        this.employeeRepository = employeeRepository;
        this.companyUserRepository = companyUserRepository;
        this.leaveMapper = leaveMapper;
    }

    // GET ALL LEAVE REQUESTS
    @Override
    @Transactional(readOnly = true)
    public List<LeaveResponse> getAllLeaves() {

        Long companyId = getAuthenticatedCompanyId();

        return leaveRepository
                .findAllByCompanyIdOrderByAppliedOnDesc(companyId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // GET LEAVE REQUESTS BY STATUS
    @Override
    @Transactional(readOnly = true)
    public List<LeaveResponse> getLeavesByStatus(String status) {

        Long companyId = getAuthenticatedCompanyId();

        if (status == null || status.trim().isEmpty()) {
            return getAllLeaves();
        }

        String normalizedStatus = status.trim().toUpperCase();

        if (!List.of("PENDING", "APPROVED", "REJECTED")
                .contains(normalizedStatus)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid leave status.");
        }

        return leaveRepository
                .findAllByCompanyIdAndStatusOrderByAppliedOnDesc(
                        companyId, normalizedStatus)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // GET LEAVE REQUEST BY ID
    @Override
    @Transactional(readOnly = true)
    public LeaveResponse getLeaveById(Long id) {

        Long companyId = getAuthenticatedCompanyId();

        LeaveRequest leave = findLeave(id, companyId);

        return toResponse(leave);
    }

    // APPROVE LEAVE REQUEST
    @Override
    public LeaveResponse approveLeave(
            Long id, LeaveDecisionRequest request) {

        Long companyId = getAuthenticatedCompanyId();

        LeaveRequest leave = findLeave(id, companyId);

        validatePending(leave);

        leave.setStatus("APPROVED");
        leave.setAdminRemarks(getRemarks(request));

        LeaveRequest updatedLeave = leaveRepository.save(leave);

        return toResponse(updatedLeave);
    }

    // REJECT LEAVE REQUEST
    @Override
    public LeaveResponse rejectLeave(
            Long id, LeaveDecisionRequest request) {

        Long companyId = getAuthenticatedCompanyId();

        LeaveRequest leave = findLeave(id, companyId);

        validatePending(leave);

        leave.setStatus("REJECTED");
        leave.setAdminRemarks(getRemarks(request));

        LeaveRequest updatedLeave = leaveRepository.save(leave);

        return toResponse(updatedLeave);
    }

    // VALIDATE PENDING STATUS
    private void validatePending(LeaveRequest leave) {

        if (!"PENDING".equalsIgnoreCase(leave.getStatus())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only pending leave requests can be approved or rejected.");
        }
    }

    // GET ADMIN REMARKS
    private String getRemarks(LeaveDecisionRequest request) {

        if (request == null || request.getAdminRemarks() == null) {
            return null;
        }

        String remarks = request.getAdminRemarks().trim();

        return remarks.isEmpty() ? null : remarks;
    }

    // FIND LEAVE REQUEST WITHIN COMPANY
    private LeaveRequest findLeave(Long id, Long companyId) {

        return leaveRepository
                .findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Leave request not found."));
    }

    // MAP LEAVE REQUEST TO RESPONSE
    private LeaveResponse toResponse(LeaveRequest leave) {

        Employee employee = employeeRepository
                .findByIdAndCompanyId(
                        leave.getEmployeeId(),
                        leave.getCompanyId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Employee not found."));

        return leaveMapper.toResponse(leave, employee);
    }

    // GET AUTHENTICATED COMPANY ID
    private Long getAuthenticatedCompanyId() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null
                || "anonymousUser".equals(authentication.getName())) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication is required.");
        }

        User user = companyUserRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Authenticated user was not found."));

        if (user.getAccountStatus() != UserStatus.ACTIVE) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Your account is not active.");
        }

        if (user.getRole() == null
                || !user.getRole().name().equals("ADMIN")) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only Admins can manage leave requests.");
        }

        Company company = user.getCompany();

        if (company == null || company.getId() == null) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Your account is not associated with a company.");
        }

        return company.getId();
    }
}
