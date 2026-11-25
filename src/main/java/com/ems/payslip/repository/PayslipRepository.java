
package com.ems.payslip.repository;

import com.ems.payslip.entity.Payslip;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PayslipRepository extends JpaRepository<Payslip, Long> {

    List<Payslip> findByEmployee_IdOrderByPayslipYearDescPayslipMonthDesc(
            Long employeeId
    );

    List<Payslip> findByEmployee_IdAndCompany_IdOrderByPayslipYearDescPayslipMonthDesc(
            Long employeeId,
            Long companyId
    );

    Optional<Payslip> findByIdAndCompany_Id(
            Long id,
            Long companyId
    );

    boolean existsByEmployee_IdAndPayslipMonthAndPayslipYear(
            Long employeeId,
            Integer payslipMonth,
            Integer payslipYear
    );
}
