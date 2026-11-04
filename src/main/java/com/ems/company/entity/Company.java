
package com.ems.company.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "companies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_name", nullable = false, length = 150)
    private String companyName;

    // Owner's email address
    @Column(name = "company_email", nullable = false, unique = true, length = 150)
    private String companyEmail;

    @Column(name = "company_code", unique = true, length = 12)
    private String companyCode;

    @Column(name = "registration_number", nullable = false, unique = true, length = 100)
    private String registrationNumber;

    @Column(name = "company_type", nullable = false, length = 50)
    private String companyType;

    @Column(name = "industry", nullable = false, length = 100)
    private String industry;

    @Column(name = "company_phone", nullable = false, length = 20)
    private String companyPhone;

    @Column(name = "alternate_phone", length = 20)
    private String alternatePhone;

    @Column(name = "company_website", length = 255)
    private String companyWebsite;

    @Column(name = "country", nullable = false, length = 100)
    private String country;

    @Column(name = "state", nullable = false, length = 100)
    private String state;

    @Column(name = "city", nullable = false, length = 100)
    private String city;

    @Column(name = "pin_code", nullable = false, length = 15)
    private String pinCode;

    @Column(name = "company_address", nullable = false, length = 500)
    private String companyAddress;

    @Column(name = "logo_path", length = 500)
    private String logoPath;

    @Column(name = "company_status", nullable = false, length = 30)
    private String companyStatus;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
