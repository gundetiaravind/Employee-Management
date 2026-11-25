package com.ems.attendance.repository;

import com.ems.attendance.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface EmpAttendanceRepository
        extends JpaRepository<Attendance, Long> {

    List<Attendance> findByEmployeeIdAndCompanyIdOrderByAttendanceDateDesc(
            Long employeeId, Long companyId);

    List<Attendance> findByEmployeeIdAndCompanyIdAndAttendanceDateBetweenOrderByAttendanceDateDesc(
            Long employeeId,
            Long companyId,
            LocalDate startDate,
            LocalDate endDate);

    Optional<Attendance> findTopByEmployeeIdAndCompanyIdOrderByAttendanceDateDesc(
            Long employeeId, Long companyId);
}