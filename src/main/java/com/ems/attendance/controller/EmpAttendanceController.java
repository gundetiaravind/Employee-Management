package com.ems.attendance.controller;


import com.ems.attendance.dto.EmpAttendanceResponse;
import com.ems.attendance.service.EmpAttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class EmpAttendanceController {

    private final EmpAttendanceService attendanceService;

    @GetMapping("/me")
    public List<EmpAttendanceResponse> getMyAttendance() {

        return attendanceService.getMyAttendance();
    }
}