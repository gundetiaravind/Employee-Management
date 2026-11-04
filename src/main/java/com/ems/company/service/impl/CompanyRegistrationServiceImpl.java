
package com.ems.company.service.impl;

import com.ems.common.enums.Role;
import com.ems.common.enums.UserStatus;
import com.ems.company.dto.CompanyRegistrationRequest;
import com.ems.company.dto.CompanyRegistrationResponse;
import com.ems.company.entity.Company;
import com.ems.company.repository.CompanyRepository;
import com.ems.company.service.CompanyRegistrationService;
import com.ems.notification.service.EmailVerificationService;
import com.ems.user.entity.User;
import com.ems.user.service.UserAccountService;

import jakarta.transaction.Transactional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Locale;
import java.util.UUID;

@Service
public class CompanyRegistrationServiceImpl
        implements CompanyRegistrationService {

    private final CompanyRepository companyRepository;
    private final UserAccountService userAccountService;
    private final EmailVerificationService emailVerificationService;

    public CompanyRegistrationServiceImpl(
            CompanyRepository companyRepository,
            UserAccountService userAccountService,
            EmailVerificationService emailVerificationService) {

        this.companyRepository = companyRepository;
        this.userAccountService = userAccountService;
        this.emailVerificationService = emailVerificationService;
    }

    @Override
    @Transactional
    public CompanyRegistrationResponse registerCompany(
            CompanyRegistrationRequest request) {

        String email = request.getOwnerEmail()
                .trim()
                .toLowerCase(Locale.ROOT);

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Password and confirm password do not match"
            );
        }

        if (companyRepository.existsByCompanyEmail(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This email address is already registered"
            );
        }

        if (companyRepository.existsByRegistrationNumber(
                request.getRegistrationNumber().trim())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This registration number is already registered"
            );
        }

        // Save company logo.
        String logoPath = saveCompanyLogo(request.getCompanyLogo());

        // Create company.
        Company company = Company.builder()
                .companyName(request.getCompanyName().trim())
                .companyEmail(email)
                .registrationNumber(
                        request.getRegistrationNumber().trim())
                .companyType(request.getCompanyType().trim())
                .industry(request.getIndustry().trim())
                .companyPhone(request.getCompanyPhone().trim())
                .alternatePhone(cleanOptional(request.getAlternatePhone()))
                .companyWebsite(cleanOptional(request.getCompanyWebsite()))
                .country(request.getCountry().trim())
                .state(request.getState().trim())
                .city(request.getCity().trim())
                .pinCode(request.getPinCode().trim())
                .companyAddress(request.getCompanyAddress().trim())
                .logoPath(logoPath)
                .companyStatus("PENDING_VERIFICATION")
                .build();

        Company savedCompany = companyRepository.save(company);

        // Create Owner account.
        User savedOwner = userAccountService.createUserAccount(
                request.getOwnerName().trim(),
                email,
                request.getPassword(),
                request.getOwnerMobileNumber().trim(),
                Role.COMPANY_OWNER,
                UserStatus.PENDING_VERIFICATION,
                false,
                savedCompany
        );

        // Generate OTP and send Owner verification email.
        emailVerificationService.sendOwnerVerificationOtp(
                savedOwner.getId()
        );

        // Return registration response.
        return CompanyRegistrationResponse.builder()
                .companyId(savedCompany.getId())
                .companyName(savedCompany.getCompanyName())
                .ownerName(savedOwner.getFullName())
                .ownerEmail(savedOwner.getEmail())
                .ownerMobileNumber(savedOwner.getMobileNumber())
                .logoPath(savedCompany.getLogoPath())
                .companyStatus(savedCompany.getCompanyStatus())
                .message(
                        "Company registration submitted successfully. "
                        + "Email verification OTP has been sent."
                )
                .build();
    }

    private String cleanOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    private String saveCompanyLogo(MultipartFile logo) {

        if (logo == null || logo.isEmpty()) {
            return null;
        }

        if (logo.getSize() > 2 * 1024 * 1024) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Company logo must not exceed 2 MB"
            );
        }

        String contentType = logo.getContentType();
        String extension;

        if ("image/png".equalsIgnoreCase(contentType)) {
            extension = ".png";
        } else if ("image/jpeg".equalsIgnoreCase(contentType)) {
            extension = ".jpg";
        } else if ("image/webp".equalsIgnoreCase(contentType)) {
            extension = ".webp";
        } else {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only PNG, JPG and WEBP logos are allowed"
            );
        }

        try {
            Path directory = Paths.get(
                    "uploads",
                    "company-logos"
            ).toAbsolutePath().normalize();

            Files.createDirectories(directory);

            String fileName = UUID.randomUUID() + extension;
            Path destination = directory.resolve(fileName).normalize();

            if (!destination.startsWith(directory)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid logo file"
                );
            }

            Files.copy(logo.getInputStream(), destination);

            return "/uploads/company-logos/" + fileName;

        } catch (IOException exception) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unable to save company logo",
                    exception
            );
        }
    }
}
