
package com.ems.project.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ems.project.entity.Project;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByTenantId(String tenantId);

    Optional<Project> findByIdAndTenantId(Long id, String tenantId);

    Optional<Project> findByProjectCodeAndTenantId(
            String projectCode, String tenantId);
}
