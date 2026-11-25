package com.ems.attendance.service.impl;

import com.ems.attendance.dto.EmpAttendanceResponse;
import com.ems.attendance.entity.Attendance;
import com.ems.attendance.repository.EmpAttendanceRepository;
import com.ems.attendance.service.EmpAttendanceService;
import com.ems.company.repository.CompanyUserRepository;
import com.ems.common.enums.Role;
import com.ems.common.enums.UserStatus;
import com.ems.employee.entity.Employee;
import com.ems.employee.repository.EmployeeRepository;
import com.ems.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class EmpAttendanceServiceImpl implements EmpAttendanceService {

    private final EmpAttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final CompanyUserRepository companyUserRepository;

    @Override
    @Transactional(readOnly = true)
    public List<EmpAttendanceResponse> getMyAttendance() {

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

        String email = authentication.getName();

        User user = companyUserRepository
                .findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Authenticated user was not found."));

        if (user.getAccountStatus() != UserStatus.ACTIVE) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Your account is not active.");
        }

        if (user.getRole() != Role.EMPLOYEE) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only employees can view their attendance.");
        }

        Employee employee = employeeRepository
                .findByUser_Id(user.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Employee profile not found."));

        List<Attendance> attendanceList =
                attendanceRepository
                        .findByEmployeeIdAndCompanyIdOrderByAttendanceDateDesc(
                                employee.getId(), employee.getCompanyId());

        return attendanceList.stream()
                .map(this::mapToResponse)
                .toList();
    }

    private EmpAttendanceResponse mapToResponse(
            Attendance attendance) {

        return new EmpAttendanceResponse(
                attendance.getId(),
                attendance.getEmployeeId(),
                attendance.getAttendanceDate().toString(),
                formatTime(attendance.getCheckInTime()),
                formatTime(attendance.getCheckOutTime()),
                formatWorkingHours(attendance),
                attendance.getStatus()
        );
    }

    private String formatTime(
            java.time.LocalTime time) {

        if (time == null) {
            return "--";
        }

        return time.format(
                DateTimeFormatter.ofPattern("hh:mm a", Locale.ENGLISH));
    }

    private String formatWorkingHours(Attendance attendance) {
        if (attendance.getCheckInTime() == null
                || attendance.getCheckOutTime() == null) {
            return "--";
        }

        long minutes = Duration.between(
                attendance.getCheckInTime(),
                attendance.getCheckOutTime()).toMinutes();

        long hours = minutes / 60;
        long remainingMinutes = minutes % 60;

        return hours + "h "
                + String.format("%02d", remainingMinutes)
                + "m";
    }
}