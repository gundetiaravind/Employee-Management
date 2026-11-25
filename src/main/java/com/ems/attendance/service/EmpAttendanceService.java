package com.ems.attendance.service;

import com.ems.attendance.dto.EmpAttendanceResponse;

import java.util.List;

public interface EmpAttendanceService {

    List<EmpAttendanceResponse> getMyAttendance();
}