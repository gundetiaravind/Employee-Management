
package com.ems.company.repository;

import com.ems.company.entity.Company;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {

    boolean existsByCompanyEmail(String companyEmail);

    boolean existsByRegistrationNumber(String registrationNumber);

    boolean existsByCompanyCode(String companyCode);

    Optional<Company> findByCompanyEmail(String companyEmail);

    Optional<Company> findByCompanyCode(String companyCode);
}
