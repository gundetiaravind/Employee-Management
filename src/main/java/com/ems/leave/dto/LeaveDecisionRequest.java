
package com.ems.leave.dto;

import jakarta.validation.constraints.Size;

public class LeaveDecisionRequest {

    @Size(max = 500, message = "Admin remarks cannot exceed 500 characters")
    private String adminRemarks;

    public LeaveDecisionRequest() {
    }

    public String getAdminRemarks() {
        return adminRemarks;
    }

    public void setAdminRemarks(String adminRemarks) {
        this.adminRemarks = adminRemarks;
    }
}
