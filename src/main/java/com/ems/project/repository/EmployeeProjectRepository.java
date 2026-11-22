
package com.ems.project.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ems.project.entity.EmployeeProject;

@Repository
public interface EmployeeProjectRepository
        extends JpaRepository<EmployeeProject, Long> {

    List<EmployeeProject> findAllByTenantId(String tenantId);

    Optional<EmployeeProject> findByIdAndTenantId(
            Long id, String tenantId);

    List<EmployeeProject> findAllByEmployeeIdAndTenantId(
            Long employeeId, String tenantId);

    List<EmployeeProject> findAllByProjectIdAndTenantId(
            Long projectId, String tenantId);
}
