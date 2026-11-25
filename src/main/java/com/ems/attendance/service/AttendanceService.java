
package com.ems.attendance.service;

import java.util.List;

import com.ems.attendance.dto.AttendanceRequest;
import com.ems.attendance.dto.AttendanceResponse;

public interface AttendanceService {

    AttendanceResponse markAttendance(AttendanceRequest request);

    List<AttendanceResponse> getAllAttendance();

    AttendanceResponse getAttendanceById(Long id);

    AttendanceResponse updateAttendance(
            Long id, AttendanceRequest request);

    List<AttendanceResponse> getAttendanceByEmployeeId(Long employeeId);
}
