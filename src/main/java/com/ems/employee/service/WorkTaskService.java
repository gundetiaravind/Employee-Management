package com.ems.employee.service;

import com.ems.employee.dto.WorkTaskResponse;

import java.util.List;


public interface WorkTaskService {

    List<WorkTaskResponse> getMyWorkTasks(Long employeeId);

    WorkTaskResponse updateStatus(
            Long employeeId, Long taskId, String status);
}