
package com.ems.payslip.dto;

import java.time.LocalDateTime;

public class PayslipResponse {

    private Long id;
    private Long employeeId;
    private String employeeName;
    private Integer payslipMonth;
    private Integer payslipYear;
    private LocalDateTime uploadDate;
    private String uploadedBy;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public Integer getPayslipMonth() {
        return payslipMonth;
    }

    public void setPayslipMonth(Integer payslipMonth) {
        this.payslipMonth = payslipMonth;
    }

    public Integer getPayslipYear() {
        return payslipYear;
    }

    public void setPayslipYear(Integer payslipYear) {
        this.payslipYear = payslipYear;
    }

    public LocalDateTime getUploadDate() {
        return uploadDate;
    }

    public void setUploadDate(LocalDateTime uploadDate) {
        this.uploadDate = uploadDate;
    }

    public String getUploadedBy() {
        return uploadedBy;
    }

    public void setUploadedBy(String uploadedBy) {
        this.uploadedBy = uploadedBy;
    }
}
