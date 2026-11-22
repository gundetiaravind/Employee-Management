
package com.ems.attendance.mapper;

import org.springframework.stereotype.Component;

import com.ems.attendance.dto.AttendanceResponse;
import com.ems.attendance.entity.Attendance;
import com.ems.employee.entity.Employee;

@Component
public class AttendanceMapper {

    public AttendanceResponse toResponse(
            Attendance attendance, Employee employee) {

        AttendanceResponse response = new AttendanceResponse();

        response.setId(attendance.getId());
        response.setEmployeeId(attendance.getEmployeeId());
        response.setEmployeeName(employee.getEmployeeName());
        response.setAttendanceDate(attendance.getAttendanceDate());
        response.setCheckInTime(attendance.getCheckInTime());
        response.setCheckOutTime(attendance.getCheckOutTime());
        response.setStatus(attendance.getStatus());
        response.setRemarks(attendance.getRemarks());
        response.setCreatedAt(attendance.getCreatedAt());
        response.setUpdatedAt(attendance.getUpdatedAt());

        return response;
    }
}
