package com.ems.finance.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ems.finance.entity.EmployeeCtc;

@Repository
public interface CtcRepository extends JpaRepository<EmployeeCtc, Long> {

    Optional<EmployeeCtc> findByEmployeeIdAndTenantId(
            Long employeeId, Long tenantId);

}