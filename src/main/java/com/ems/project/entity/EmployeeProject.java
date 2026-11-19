
package com.ems.project.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "employee_projects")
public class EmployeeProject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "assignment_status", nullable = false)
    private String assignmentStatus = "ACTIVE";

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(name = "project_start_date", nullable = false)
    private LocalDate projectStartDate;

    @Column(name = "project_end_date")
    private LocalDate projectEndDate;

    @Column(
        name = "reporting_manager_employee_code",
        nullable = false,
        length = 6
    )
    private String reportingManagerEmployeeCode;

    @Column(
        name = "reporting_manager_email",
        nullable = false,
        length = 150
    )
    private String reportingManagerEmail;

    // Company tenant ID
    @Column(name = "tenant_id", nullable = false, length = 50)
    private String tenantId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public EmployeeProject() {
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAssignmentStatus() {
        return assignmentStatus;
    }

    public void setAssignmentStatus(String assignmentStatus) {
        this.assignmentStatus = assignmentStatus;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
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

    public void setReportingManagerEmployeeCode(
            String reportingManagerEmployeeCode) {
        this.reportingManagerEmployeeCode = reportingManagerEmployeeCode;
    }

    public String getReportingManagerEmail() {
        return reportingManagerEmail;
    }

    public void setReportingManagerEmail(String reportingManagerEmail) {
        this.reportingManagerEmail = reportingManagerEmail;
    }

    public String getTenantId() {
        return tenantId;
    }

    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
