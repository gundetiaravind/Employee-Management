package com.ems.company.repository;

import com.ems.company.entity.Employee;
import com.ems.company.entity.EmployeeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

  List<Employee> findByCompanyIdOrderByCreatedAtDesc(Long companyId);

  Optional<Employee> findByIdAndCompanyId(Long id, Long companyId);

  boolean existsByCompanyIdAndEmploymentCode(Long companyId, String employmentCode);

  boolean existsByCompanyIdAndCompanyEmail(Long companyId, String companyEmail);

  boolean existsByCompanyIdAndEmploymentCodeAndIdNot(Long companyId, String employmentCode, Long id);

  boolean existsByCompanyIdAndCompanyEmailAndIdNot(Long companyId, String companyEmail, Long id);

  long countByCompanyId(Long companyId);

  long countByCompanyIdAndEmployeeStatus(Long companyId, EmployeeStatus status);

  // ========== ADD THIS METHOD (for company growth) ==========
  @Query("""
      SELECT COUNT(e) FROM Employee e
      WHERE e.companyId = :companyId
        AND e.createdAt >= :start
        AND e.createdAt < :end
      """)
  long countByCompanyIdAndCreatedAtBetween(
      @Param("companyId") Long companyId,
      @Param("start") LocalDateTime start,
      @Param("end") LocalDateTime end);
  // ==========================================================
}