
package com.ems.leave.mapper;

import org.springframework.stereotype.Component;

import com.ems.leave.dto.LeaveResponse;
import com.ems.leave.entity.LeaveRequest;
import com.ems.employee.entity.Employee;

@Component
public class LeaveMapper {

    public LeaveResponse toResponse(
            LeaveRequest leave,
            Employee employee) {

        LeaveResponse response = new LeaveResponse();

        response.setId(leave.getId());
        response.setEmployeeId(leave.getEmployeeId());
        response.setEmployeeName(employee.getEmployeeName());
        response.setLeaveType(leave.getLeaveType());
        response.setStartDate(leave.getStartDate());
        response.setEndDate(leave.getEndDate());
        response.setDays(leave.getDays());
        response.setReason(leave.getReason());
        response.setAppliedOn(leave.getAppliedOn());
        response.setStatus(leave.getStatus());
        response.setAdminRemarks(leave.getAdminRemarks());
        response.setCreatedAt(leave.getCreatedAt());
        response.setUpdatedAt(leave.getUpdatedAt());

        return response;
    }
}
