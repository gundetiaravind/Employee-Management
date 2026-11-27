
package com.ems.project.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ems.project.entity.EmployeeProject;

public interface EmployeeProjectRepository
        extends JpaRepository<EmployeeProject, Long> {
    Optional<EmployeeProject> findByIdAndEmployeeId(
            Long id, Long employeeId);

    List<EmployeeProject> findByEmployeeId(Long employeeId);

    List<EmployeeProject> findByTenantId(String tenantId);

    List<EmployeeProject> findByEmployeeIdAndTenantId(
            Long employeeId, String tenantId);

    List<EmployeeProject> findByProjectIdAndTenantId(
            Long projectId, String tenantId);

    List<EmployeeProject> findByEmployeeIdAndTenantIdAndAssignmentStatus(
            Long employeeId, String tenantId, String assignmentStatus);

    boolean existsByEmployeeIdAndProjectIdAndTenantIdAndAssignmentStatus(
            Long employeeId,
            Long projectId,
            String tenantId,
            String assignmentStatus
    );
}
