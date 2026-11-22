
package com.ems.employee.repository;

import com.ems.company.entity.EmployeeStatus;
import com.ems.employee.entity.Employee;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    // Employee profile operations
    Optional<Employee> findByCompanyEmail(String companyEmail);

    Optional<Employee> findByUser_Id(Long userId);

    // Company employee operations
    List<Employee> findByCompanyIdOrderByCreatedAtDesc(Long companyId);

    Optional<Employee> findByIdAndCompanyId(Long id, Long companyId);

    Optional<Employee> findByCompanyIdAndCompanyEmail(
            Long companyId, String companyEmail);

    // Duplicate validation
    boolean existsByCompanyIdAndEmploymentCode(
            Long companyId, String employmentCode);

    boolean existsByCompanyIdAndCompanyEmail(
            Long companyId, String companyEmail);

    boolean existsByCompanyIdAndEmploymentCodeAndIdNot(
            Long companyId, String employmentCode, Long id);

    boolean existsByCompanyIdAndCompanyEmailAndIdNot(
            Long companyId, String companyEmail, Long id);

    // Dashboard statistics
    long countByCompanyId(Long companyId);

    long countByCompanyIdAndEmployeeStatus(
            Long companyId, EmployeeStatus employeeStatus);

    long countByCompanyIdAndCreatedAtBetween(
            Long companyId,
            LocalDateTime startDate,
            LocalDateTime endDate);
}
