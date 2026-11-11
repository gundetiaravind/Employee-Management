package com.ems.company.repository;

import com.ems.company.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {

  Optional<Company> findByCompanyEmail(String companyEmail);

  boolean existsByCompanyEmail(String companyEmail);

  boolean existsByCompanyCode(String companyCode);
}
