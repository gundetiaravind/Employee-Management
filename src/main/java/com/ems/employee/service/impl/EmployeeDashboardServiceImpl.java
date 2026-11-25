package com.ems.employee.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ems.attendance.entity.Attendance;
import com.ems.attendance.repository.EmpAttendanceRepository;
import com.ems.common.enums.Role;
import com.ems.common.enums.UserStatus;
import com.ems.employee.dto.EmployeeDashboardActivityResponse;
import com.ems.employee.dto.EmployeeDashboardResponse;
import com.ems.employee.entity.Employee;
import com.ems.employee.repository.EmployeeRepository;
import com.ems.employee.service.EmployeeDashboardService;
import com.ems.leave.entity.LeaveRequest;
import com.ems.leave.repository.LeaveRepository;
import com.ems.payslip.entity.Payslip;
import com.ems.payslip.repository.EmployeePayslipRepository;
import com.ems.project.entity.EmployeeProject;
import com.ems.project.entity.Project;
import com.ems.project.repository.EmployeeProjectRepository;
import com.ems.project.repository.ProjectRepository;
import com.ems.user.entity.User;
import com.ems.company.repository.CompanyUserRepository;

@Service
@Transactional(readOnly = true)
public class EmployeeDashboardServiceImpl implements EmployeeDashboardService {

    private static final int ANNUAL_LEAVE_ALLOWANCE = 12;
    private static final int RECENT_ACTIVITY_LIMIT = 3;
    private static final BigDecimal HALF_DAY = new BigDecimal("0.5");

    private final CompanyUserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final EmpAttendanceRepository attendanceRepository;
    private final LeaveRepository leaveRepository;
    private final EmployeeProjectRepository employeeProjectRepository;
    private final ProjectRepository projectRepository;
    private final EmployeePayslipRepository payslipRepository;

    public EmployeeDashboardServiceImpl(
            CompanyUserRepository userRepository,
            EmployeeRepository employeeRepository,
            EmpAttendanceRepository attendanceRepository,
            LeaveRepository leaveRepository,
            EmployeeProjectRepository employeeProjectRepository,
            ProjectRepository projectRepository,
            EmployeePayslipRepository payslipRepository) {
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.attendanceRepository = attendanceRepository;
        this.leaveRepository = leaveRepository;
        this.employeeProjectRepository = employeeProjectRepository;
        this.projectRepository = projectRepository;
        this.payslipRepository = payslipRepository;
    }

    @Override
    public EmployeeDashboardResponse getDashboard(String email) {
        Employee employee = getAuthenticatedEmployee(email);
        YearMonth currentMonth = YearMonth.now();

        List<Attendance> monthlyAttendance =
                attendanceRepository
                        .findByEmployeeIdAndCompanyIdAndAttendanceDateBetweenOrderByAttendanceDateDesc(
                                employee.getId(),
                                employee.getCompanyId(),
                                currentMonth.atDay(1),
                                currentMonth.atEndOfMonth());

        BigDecimal attendanceDays = calculateAttendanceDays(monthlyAttendance);

        List<LeaveRequest> leaves =
                leaveRepository.findAllByCompanyIdAndEmployeeIdOrderByAppliedOnDesc(
                        employee.getCompanyId(), employee.getId());

        int approvedLeaveDays = leaves.stream()
                .filter(leave -> "APPROVED".equalsIgnoreCase(leave.getStatus()))
                .map(LeaveRequest::getDays)
                .filter(days -> days != null && days > 0)
                .mapToInt(Integer::intValue)
                .sum();

        int leaveBalance = Math.max(
                0, ANNUAL_LEAVE_ALLOWANCE - approvedLeaveDays);

        List<EmployeeProject> assignments =
                employeeProjectRepository.findByEmployeeId(employee.getId())
                        .stream()
                        .filter(this::isActiveAssignment)
                        .toList();

        long pendingTasks = assignments.stream()
                .filter(assignment -> "PENDING".equalsIgnoreCase(
                        assignment.getWorkStatus()))
                .count();

        List<Payslip> payslips =
                payslipRepository
                        .findByEmployee_IdAndCompany_IdOrderByPayslipYearDescPayslipMonthDesc(
                                employee.getId(), employee.getCompanyId());
        Payslip latestPayslip = payslips.stream().findFirst().orElse(null);

        return new EmployeeDashboardResponse(
                attendanceDays,
                leaveBalance,
                pendingTasks,
                latestPayslip == null ? null : latestPayslip.getNetSalary(),
                formatPayslipPeriod(latestPayslip),
                buildRecentActivities(
                        employee.getId(),
                        employee.getCompanyId(),
                        leaves,
                        assignments,
                        payslips));
    }

    private Employee getAuthenticatedEmployee(String email) {
        User user = userRepository.findByEmail(email)
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
                    "Only employees can view their dashboard.");
        }

        return employeeRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Employee profile not found for this account."));
    }

    private BigDecimal calculateAttendanceDays(List<Attendance> attendance) {
        long fullDays = attendance.stream()
                .map(Attendance::getStatus)
                .filter(status -> status != null)
                .map(String::trim)
                .map(String::toUpperCase)
                .filter(status -> status.equals("PRESENT")
                        || status.equals("LATE"))
                .count();

        long halfDays = attendance.stream()
                .map(Attendance::getStatus)
                .filter(status -> status != null
                        && "HALF_DAY".equalsIgnoreCase(
                                status.trim().replaceAll("[\\s-]+", "_")))
                .count();

        return BigDecimal.valueOf(fullDays)
                .add(HALF_DAY.multiply(BigDecimal.valueOf(halfDays)));
    }

    private boolean isActiveAssignment(EmployeeProject assignment) {
        return assignment.getAssignmentStatus() != null
                && "ACTIVE".equalsIgnoreCase(
                        assignment.getAssignmentStatus().trim());
    }

    private List<EmployeeDashboardActivityResponse> buildRecentActivities(
            Long employeeId,
            Long companyId,
            List<LeaveRequest> leaves,
            List<EmployeeProject> assignments,
            List<Payslip> payslips) {
        List<EmployeeDashboardActivityResponse> activities =
                new ArrayList<>();

        attendanceRepository
                .findTopByEmployeeIdAndCompanyIdOrderByAttendanceDateDesc(
                        employeeId, companyId)
                .ifPresent(attendance -> activities.add(
                        new EmployeeDashboardActivityResponse(
                                "ATTENDANCE",
                                "Attendance recorded",
                                "Your " + readableStatus(attendance.getStatus())
                                        + " attendance was recorded.",
                                latestTimestamp(
                                        attendance.getCreatedAt(),
                                        attendance.getUpdatedAt()))));

        if (!leaves.isEmpty()) {
            LeaveRequest leave = leaves.get(0);
            activities.add(new EmployeeDashboardActivityResponse(
                    "LEAVE",
                    "Leave request submitted",
                    leave.getLeaveType() + " request: "
                            + readableStatus(leave.getStatus()) + ".",
                    leave.getCreatedAt() != null
                            ? leave.getCreatedAt()
                            : leave.getAppliedOn().atStartOfDay()));
        }

        addLatestTaskActivity(assignments, activities);

        payslips.stream()
                .filter(payslip -> payslip.getUploadDate() != null)
                .max(Comparator.comparing(Payslip::getUploadDate))
                .ifPresent(payslip -> activities.add(
                        new EmployeeDashboardActivityResponse(
                                "PAYROLL",
                                "Payroll updated",
                                "Your " + formatPayslipPeriod(payslip)
                                        + " payslip is available.",
                                payslip.getUploadDate())));

        return activities.stream()
                .filter(activity -> activity.getOccurredAt() != null)
                .sorted(Comparator.comparing(
                        EmployeeDashboardActivityResponse::getOccurredAt)
                        .reversed())
                .limit(RECENT_ACTIVITY_LIMIT)
                .toList();
    }

    private void addLatestTaskActivity(
            List<EmployeeProject> assignments,
            List<EmployeeDashboardActivityResponse> activities) {
        if (assignments.isEmpty()) {
            return;
        }

        List<Long> projectIds = assignments.stream()
                .map(EmployeeProject::getProjectId)
                .distinct()
                .toList();
        Map<Long, Project> projectsById = projectRepository
                .findAllById(projectIds)
                .stream()
                .collect(Collectors.toMap(Project::getId, Function.identity()));

        assignments.stream()
                .max(Comparator.comparing(
                        assignment -> latestTimestamp(
                                assignment.getCreatedAt(),
                                assignment.getUpdatedAt()),
                        Comparator.nullsFirst(Comparator.naturalOrder())))
                .ifPresent(assignment -> {
                    Project project = projectsById.get(
                            assignment.getProjectId());
                    String projectName = project == null
                            ? "your project"
                            : project.getProjectName();

                    activities.add(new EmployeeDashboardActivityResponse(
                            "TASK",
                            "Work assignment updated",
                            projectName + " is "
                                    + readableStatus(
                                            assignment.getWorkStatus()) + ".",
                            latestTimestamp(
                                    assignment.getCreatedAt(),
                                    assignment.getUpdatedAt())));
                });
    }

    private LocalDateTime latestTimestamp(
            LocalDateTime createdAt, LocalDateTime updatedAt) {
        if (createdAt == null) {
            return updatedAt;
        }
        if (updatedAt == null || createdAt.isAfter(updatedAt)) {
            return createdAt;
        }
        return updatedAt;
    }

    private String readableStatus(String status) {
        if (status == null || status.isBlank()) {
            return "updated";
        }

        String normalized = status.trim()
                .replace('_', ' ')
                .toLowerCase(Locale.ENGLISH);
        return Character.toUpperCase(normalized.charAt(0))
                + normalized.substring(1);
    }

    private String formatPayslipPeriod(Payslip payslip) {
        if (payslip == null
                || payslip.getPayslipMonth() == null
                || payslip.getPayslipMonth() < 1
                || payslip.getPayslipMonth() > 12) {
            return null;
        }

        String month = Month.of(payslip.getPayslipMonth())
                .getDisplayName(TextStyle.FULL, Locale.ENGLISH);
        return month + " " + payslip.getPayslipYear();
    }
}
