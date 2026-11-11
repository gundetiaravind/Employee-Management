package com.ems.company.repository;

import com.ems.common.enums.Role;
import com.ems.common.enums.UserStatus;
import com.ems.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyUserRepository extends JpaRepository<User, Long> {

  List<User> findByCompany_IdAndRole(Long companyId, Role role);

  Optional<User> findByIdAndCompany_IdAndRole(Long id, Long companyId, Role role);

  Optional<User> findFirstByCompany_IdAndRole(Long companyId, Role role);

  boolean existsByEmail(String email);

  Optional<User> findByEmail(String email);

  long countByCompany_IdAndRole(Long companyId, Role role);

  long countByCompany_IdAndRoleAndAccountStatus(Long companyId, Role role, UserStatus status);
}
