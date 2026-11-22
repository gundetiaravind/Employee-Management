
package com.ems.attendance.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ems.attendance.entity.Attendance;

@Repository
public interface AttendanceRepository
        extends JpaRepository<Attendance, Long> {

    List<Attendance> findAllByCompanyIdOrderByAttendanceDateDesc(
            Long companyId);

    Optional<Attendance> findByIdAndCompanyId(
            Long id, Long companyId);

    List<Attendance> findAllByEmployeeIdAndCompanyIdOrderByAttendanceDateDesc(
            Long employeeId, Long companyId);

    Optional<Attendance> findByEmployeeIdAndCompanyIdAndAttendanceDate(
            Long employeeId, Long companyId, LocalDate attendanceDate);

    boolean existsByEmployeeIdAndCompanyIdAndAttendanceDate(
            Long employeeId, Long companyId, LocalDate attendanceDate);
}
