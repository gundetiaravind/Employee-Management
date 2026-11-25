package com.ems.attendance.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class EmpAttendanceResponse {

    private Long id;
    private Long employeeId;

    private String date;
    private String checkIn;
    private String checkOut;
    private String hours;

    private String status;
}