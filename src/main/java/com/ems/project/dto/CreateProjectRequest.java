
package com.ems.project.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateProjectRequest {

    @NotBlank(message = "Project code is required")
    private String projectCode;

    @NotBlank(message = "Project name is required")
    private String projectName;

    @NotBlank(message = "Client name is required")
    private String clientName;

    @NotNull(message = "Project start date is required")
    private LocalDate projectStartDate;

    @NotNull(message = "Project end date is required")
    private LocalDate projectEndDate;

    @NotBlank(message = "Reporting manager employee code is required")
    private String reportingManagerEmployeeCode;

    @NotBlank(message = "Reporting manager email is required")
    @Email(message = "Enter a valid reporting manager email")
    private String reportingManagerEmail;

    // Validate project date range
    @AssertTrue(message = "Project end date cannot be before start date")
    public boolean isProjectDateRangeValid() {

        if (projectStartDate == null || projectEndDate == null) {
            return true;
        }

        return !projectEndDate.isBefore(projectStartDate);
    }

    public String getProjectCode() {
        return projectCode;
    }

    public void setProjectCode(String projectCode) {
        this.projectCode = projectCode;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public String getClientName() {
        return clientName;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    public LocalDate getProjectStartDate() {
        return projectStartDate;
    }

    public void setProjectStartDate(LocalDate projectStartDate) {
        this.projectStartDate = projectStartDate;
    }

    public LocalDate getProjectEndDate() {
        return projectEndDate;
    }

    public void setProjectEndDate(LocalDate projectEndDate) {
        this.projectEndDate = projectEndDate;
    }

    public String getReportingManagerEmployeeCode() {
        return reportingManagerEmployeeCode;
    }

    public void setReportingManagerEmployeeCode(String reportingManagerEmployeeCode) {
        this.reportingManagerEmployeeCode = reportingManagerEmployeeCode;
    }

    public String getReportingManagerEmail() {
        return reportingManagerEmail;
    }

    public void setReportingManagerEmail(String reportingManagerEmail) {
        this.reportingManagerEmail = reportingManagerEmail;
    }
}
