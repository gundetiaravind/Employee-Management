
package com.ems.attendance.service.impl;

import java.util.List;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ems.attendance.dto.AttendanceRequest;
import com.ems.attendance.dto.AttendanceResponse;
import com.ems.attendance.entity.Attendance;
import com.ems.attendance.mapper.AttendanceMapper;
import com.ems.attendance.repository.AttendanceRepository;
import com.ems.attendance.service.AttendanceService;
import com.ems.company.entity.Company;
import com.ems.company.repository.CompanyUserRepository;
import com.ems.common.enums.UserStatus;
import com.ems.employee.entity.Employee;
import com.ems.employee.repository.EmployeeRepository;
import com.ems.user.entity.User;

@Service
@Transactional
public class AttendanceServiceImpl implements AttendanceService {

    private static final Set<String> VALID_STATUSES = Set.of(
            "PRESENT", "ABSENT", "HALF_DAY", "LATE"
    );

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final CompanyUserRepository companyUserRepository;
    private final AttendanceMapper attendanceMapper;

    public AttendanceServiceImpl(
            AttendanceRepository attendanceRepository,
            EmployeeRepository employeeRepository,
            CompanyUserRepository companyUserRepository,
            AttendanceMapper attendanceMapper) {

        this.attendanceRepository = attendanceRepository;
        this.employeeRepository = employeeRepository;
        this.companyUserRepository = companyUserRepository;
        this.attendanceMapper = attendanceMapper;
    }

    // MARK ATTENDANCE
    @Override
    public AttendanceResponse markAttendance(AttendanceRequest request) {

        Long companyId = getAuthenticatedCompanyId();

        validateRequest(request);

        Employee employee = findEmployee(
                request.getEmployeeId(), companyId);

        if (attendanceRepository.existsByEmployeeIdAndCompanyIdAndAttendanceDate(
                request.getEmployeeId(),
                companyId,
                request.getAttendanceDate())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Attendance already exists for this employee on this date.");
        }

        Attendance attendance = new Attendance();

        attendance.setCompanyId(companyId);
        attendance.setEmployeeId(employee.getId());
        attendance.setAttendanceDate(request.getAttendanceDate());
        attendance.setCheckInTime(request.getCheckInTime());
        attendance.setCheckOutTime(request.getCheckOutTime());
        attendance.setStatus(request.getStatus().trim().toUpperCase());
        attendance.setRemarks(request.getRemarks());

        Attendance saved = attendanceRepository.save(attendance);

        return attendanceMapper.toResponse(saved, employee);
    }

    // GET ALL ATTENDANCE
    @Override
    @Transactional(readOnly = true)
    public List<AttendanceResponse> getAllAttendance() {

        Long companyId = getAuthenticatedCompanyId();

        return attendanceRepository
                .findAllByCompanyIdOrderByAttendanceDateDesc(companyId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // GET ATTENDANCE BY ID
    @Override
    @Transactional(readOnly = true)
    public AttendanceResponse getAttendanceById(Long id) {

        Long companyId = getAuthenticatedCompanyId();

        Attendance attendance = findAttendance(id, companyId);

        return toResponse(attendance);
    }

    // UPDATE ATTENDANCE
    @Override
    public AttendanceResponse updateAttendance(
            Long id, AttendanceRequest request) {

        Long companyId = getAuthenticatedCompanyId();

        validateRequest(request);

        Attendance attendance = findAttendance(id, companyId);

        Employee employee = findEmployee(
                request.getEmployeeId(), companyId);

        attendanceRepository
                .findByEmployeeIdAndCompanyIdAndAttendanceDate(
                        request.getEmployeeId(),
                        companyId,
                        request.getAttendanceDate())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new ResponseStatusException(
                                HttpStatus.CONFLICT,
                                "Attendance already exists for this employee on this date.");
                    }
                });

        attendance.setEmployeeId(employee.getId());
        attendance.setAttendanceDate(request.getAttendanceDate());
        attendance.setCheckInTime(request.getCheckInTime());
        attendance.setCheckOutTime(request.getCheckOutTime());
        attendance.setStatus(request.getStatus().trim().toUpperCase());
        attendance.setRemarks(request.getRemarks());

        Attendance updated = attendanceRepository.save(attendance);

        return attendanceMapper.toResponse(updated, employee);
    }

    // GET ATTENDANCE BY EMPLOYEE
    @Override
    @Transactional(readOnly = true)
    public List<AttendanceResponse> getAttendanceByEmployeeId(
            Long employeeId) {

        Long companyId = getAuthenticatedCompanyId();

        findEmployee(employeeId, companyId);

        return attendanceRepository
                .findAllByEmployeeIdAndCompanyIdOrderByAttendanceDateDesc(
                        employeeId, companyId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // MAP ATTENDANCE TO RESPONSE
    private AttendanceResponse toResponse(Attendance attendance) {

        Employee employee = findEmployee(
                attendance.getEmployeeId(),
                attendance.getCompanyId());

        return attendanceMapper.toResponse(attendance, employee);
    }

    // FIND EMPLOYEE WITHIN AUTHENTICATED COMPANY
    private Employee findEmployee(Long employeeId, Long companyId) {

        return employeeRepository
                .findByIdAndCompanyId(employeeId, companyId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Employee not found in your company."));
    }

    // FIND ATTENDANCE WITHIN AUTHENTICATED COMPANY
    private Attendance findAttendance(Long id, Long companyId) {

        return attendanceRepository
                .findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Attendance record not found."));
    }

    // VALIDATE ATTENDANCE REQUEST
    private void validateRequest(AttendanceRequest request) {

        if (request == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Attendance details are required.");
        }

        if (request.getEmployeeId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Employee ID is required.");
        }

        if (request.getAttendanceDate() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Attendance date is required.");
        }

        if (request.getStatus() == null
                || request.getStatus().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Attendance status is required.");
        }

        String status = request.getStatus().trim().toUpperCase();

        if (!VALID_STATUSES.contains(status)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid attendance status. Allowed values: PRESENT, ABSENT, HALF_DAY, LATE.");
        }

        if ("ABSENT".equals(status)
                && (request.getCheckInTime() != null
                || request.getCheckOutTime() != null)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Absent employees cannot have check-in or check-out times.");
        }

        if (request.getCheckInTime() == null
                && request.getCheckOutTime() != null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Check-in time is required when check-out time is provided.");
        }

        if (request.getCheckInTime() != null
                && request.getCheckOutTime() != null
                && request.getCheckOutTime().isBefore(
                        request.getCheckInTime())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Check-out time cannot be earlier than check-in time.");
        }
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
                    "Only Admins can manage attendance.");
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
