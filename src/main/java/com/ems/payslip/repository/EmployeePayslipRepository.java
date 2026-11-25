package com.ems.payslip.repository;

import com.ems.payslip.entity.Payslip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeePayslipRepository extends JpaRepository<Payslip, Long> {

    List<Payslip> findByEmployee_IdAndCompany_IdOrderByPayslipYearDescPayslipMonthDesc(
            Long employeeId, Long companyId);

    Optional<Payslip> findByIdAndEmployee_IdAndCompany_Id(
            Long payslipId, Long employeeId, Long companyId);
}