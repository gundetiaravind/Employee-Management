package com.ems.platformmanager.service.impl;

import java.util.List;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ems.common.enums.Role;
import com.ems.common.enums.UserStatus;
import com.ems.company.entity.Company;
import com.ems.company.repository.CompanyRepository;
import com.ems.platformmanager.dto.CompanyManagementResponse;
import com.ems.platformmanager.service.CompanyManagementService;
import com.ems.user.entity.User;
import com.ems.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class CompanyManagementServiceImpl
        implements CompanyManagementService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CompanyManagementResponse> getAllCompanies(String status) {

        return companyRepository.findAll()
                .stream()
                .map(company -> {

                    User owner = getCompanyOwner(company.getId());

                    return mapToResponse(company, owner);
                })
                .filter(response ->
                        status == null
                        || status.isBlank()
                        || response.companyStatus().equalsIgnoreCase(
                                status.trim()
                        )
                )
                .toList();
    }

    @Override
    public CompanyManagementResponse approveCompany(Long companyId) {

        Company company = findCompany(companyId);

        User owner = getCompanyOwner(companyId);

        if (owner == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Company owner not found"
            );
        }

        if (!owner.isEmailVerified()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Owner must verify their email before company approval"
            );
        }

        if ("APPROVED".equalsIgnoreCase(company.getCompanyStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Company is already approved"
            );
        }

        if ("REJECTED".equalsIgnoreCase(company.getCompanyStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Rejected company cannot be approved"
            );
        }

        company.setCompanyStatus("APPROVED");

        owner.setAccountStatus(UserStatus.ACTIVE);

        companyRepository.save(company);
        userRepository.save(owner);

        return mapToResponse(company, owner);
    }

    @Override
    public CompanyManagementResponse rejectCompany(Long companyId) {

        Company company = findCompany(companyId);

        User owner = getCompanyOwner(companyId);

        if (owner == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Company owner not found"
            );
        }

        if ("APPROVED".equalsIgnoreCase(company.getCompanyStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "An approved company cannot be rejected"
            );
        }

        if ("REJECTED".equalsIgnoreCase(company.getCompanyStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Company is already rejected"
            );
        }

        company.setCompanyStatus("REJECTED");

        owner.setAccountStatus(UserStatus.BLOCKED);

        companyRepository.save(company);
        userRepository.save(owner);

        return mapToResponse(company, owner);
    }

    private Company findCompany(Long companyId) {

        return companyRepository.findById(companyId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Company not found with ID: " + companyId
                ));
    }

    private User getCompanyOwner(Long companyId) {

        return userRepository.findByCompany_Id(companyId)
                .stream()
                .filter(user -> user.getRole() == Role.COMPANY_OWNER)
                .findFirst()
                .orElse(null);
    }

    private CompanyManagementResponse mapToResponse(
            Company company,
            User owner) {

        String displayStatus = company.getCompanyStatus();

        // A verified owner is ready for Platform Manager approval.
        if ("PENDING_VERIFICATION".equalsIgnoreCase(displayStatus)
                && owner != null
                && owner.isEmailVerified()) {

            displayStatus = "PENDING_APPROVAL";
        }

        return new CompanyManagementResponse(

                company.getId(),
                company.getCompanyName(),
                company.getCompanyEmail(),
                company.getCompanyCode(),
                company.getRegistrationNumber(),
                company.getCompanyType(),
                company.getIndustry(),
                company.getCompanyPhone(),
                company.getAlternatePhone(),
                company.getCompanyWebsite(),
                company.getCountry(),
                company.getState(),
                company.getCity(),
                company.getPinCode(),
                company.getCompanyAddress(),
                company.getLogoPath(),
                displayStatus,
                company.getCreatedAt(),

                owner != null ? owner.getId() : null,
                owner != null ? owner.getFullName() : null,
                owner != null ? owner.getEmail() : null,
                owner != null ? owner.getMobileNumber() : null,
                owner != null && owner.isEmailVerified(),
                owner != null
                        ? owner.getAccountStatus().name()
                        : null
        );
    }
}