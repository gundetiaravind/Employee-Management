
package com.ems.employee.entity;

import com.ems.company.entity.EmployeeStatus;
import com.ems.user.entity.User;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "company_employees", uniqueConstraints = {
        @UniqueConstraint(name = "uk_company_employment_code", columnNames = { "company_id", "employment_code" }),
        @UniqueConstraint(name = "uk_company_employee_email", columnNames = { "company_id", "company_email" }),
        @UniqueConstraint(name = "uk_employee_user", columnNames = { "user_id" })
})
@Getter
@Setter
@NoArgsConstructor
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Company relationship
    @Column(name = "company_id", nullable = false)
    private Long companyId;

    // Employee login account
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    // Basic employment details
    @Column(name = "employment_code", nullable = false, length = 20)
    private String employmentCode;

    @Column(name = "employee_name", nullable = false, length = 150)
    private String employeeName;

    @Column(name = "company_email", nullable = false, length = 150)
    private String companyEmail;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "alternate_phone", length = 20)
    private String alternatePhone;

    // Personal information
    @Column(name = "profile_photo_url", length = 500)
    private String profilePhotoUrl;

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "city", length = 50)
    private String city;

    @Column(name = "state", length = 50)
    private String state;

    @Column(name = "postal_code", length = 10)
    private String postalCode;

    // Employment information
    @Column(name = "department", length = 100)
    private String department;

    @Column(name = "designation", length = 100)
    private String designation;

    @Column(name = "manager_name", length = 150)
    private String managerName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporting_manager_id")
    private Employee reportingManager;

    @Column(name = "date_of_joining")
    private LocalDate dateOfJoining;

    @Column(name = "employment_type", length = 30)
    private String employmentType;

    @Enumerated(EnumType.STRING)
    @Column(name = "employee_status", length = 30)
    private EmployeeStatus employeeStatus;

    // Audit information
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

        if (employeeStatus == null) {
            employeeStatus = EmployeeStatus.ACTIVE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
