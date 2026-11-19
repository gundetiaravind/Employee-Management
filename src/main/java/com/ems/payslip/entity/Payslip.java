
package com.ems.payslip.entity;

import com.ems.company.entity.Employee;
import com.ems.company.entity.Company;
import com.ems.user.entity.User;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "payslips",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_employee_payslip_month_year",
            columnNames = {"employee_id", "payslip_month", "payslip_year"}
        )
    }
)
public class Payslip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(name = "payslip_month", nullable = false)
    private Integer payslipMonth;

    @Column(name = "payslip_year", nullable = false)
    private Integer payslipYear;

    @Column(name = "file_storage_reference", nullable = false, length = 500)
    private String fileStorageReference;

    @Column(name = "upload_date", nullable = false)
    private LocalDateTime uploadDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by", nullable = false)
    private User uploadedBy;

    @PrePersist
    protected void onCreate() {
        uploadDate = LocalDateTime.now();
    }

    public Payslip() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public Company getCompany() {
        return company;
    }

    public void setCompany(Company company) {
        this.company = company;
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

    public String getFileStorageReference() {
        return fileStorageReference;
    }

    public void setFileStorageReference(String fileStorageReference) {
        this.fileStorageReference = fileStorageReference;
    }

    public LocalDateTime getUploadDate() {
        return uploadDate;
    }

    public void setUploadDate(LocalDateTime uploadDate) {
        this.uploadDate = uploadDate;
    }

    public User getUploadedBy() {
        return uploadedBy;
    }

    public void setUploadedBy(User uploadedBy) {
        this.uploadedBy = uploadedBy;
    }
}
