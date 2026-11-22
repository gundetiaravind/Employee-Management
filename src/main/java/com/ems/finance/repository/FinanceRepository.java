package com.ems.finance.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ems.finance.entity.EmployeeFinance;

@Repository
public interface FinanceRepository extends JpaRepository<EmployeeFinance, Long> {

    Optional<EmployeeFinance> findByEmployeeIdAndTenantId(
            Long employeeId, Long tenantId);

}