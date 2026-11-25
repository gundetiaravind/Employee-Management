package com.ems.employee.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class UpdateTaskStatusRequest {

    @NotBlank(message = "Status is required")
    @Pattern(
            regexp = "Pending|In Progress|Completed",
            message = "Status must be Pending, In Progress, or Completed")
    private String status;

    public UpdateTaskStatusRequest() {
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}