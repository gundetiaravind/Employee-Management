
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
                    "Password and confirm password do not match");
        }

        if (companyRepository.existsByCompanyEmail(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This email address is already registered");
        }

        String registrationNumber = request.getRegistrationNumber().trim();

        if (companyRepository.existsByRegistrationNumber(registrationNumber)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This registration number is already registered");
        }

        // Save company logo.
        String logoPath = saveCompanyLogo(request.getCompanyLogo());

        // Create company.
        Company company = new Company();

        company.setCompanyName(request.getCompanyName().trim());
        company.setCompanyEmail(email);
        company.setRegistrationNumber(registrationNumber);
        company.setCompanyType(request.getCompanyType().trim());
        company.setIndustry(request.getIndustry().trim());
        company.setCompanyPhone(request.getCompanyPhone().trim());
        company.setAlternatePhone(cleanOptional(request.getAlternatePhone()));
        company.setCompanyWebsite(cleanOptional(request.getCompanyWebsite()));
        company.setCountry(request.getCountry().trim());
        company.setState(request.getState().trim());
        company.setCity(request.getCity().trim());
        company.setPinCode(request.getPinCode().trim());
        company.setCompanyAddress(request.getCompanyAddress().trim());
        company.setLogoPath(logoPath);
        company.setCompanyStatus("PENDING_VERIFICATION");

        Company savedCompany = companyRepository.save(company);

        // Create company owner account.
        User savedOwner = userAccountService.createUserAccount(
                request.getOwnerName().trim(),
                email,
                request.getPassword(),
                request.getOwnerMobileNumber().trim(),
                Role.COMPANY_OWNER,
                UserStatus.PENDING_VERIFICATION,
                false,
                savedCompany);

        // Generate and send owner verification OTP.
        emailVerificationService.sendOwnerVerificationOtp(
                savedOwner.getId());

        // Prepare response.
        CompanyRegistrationResponse response = new CompanyRegistrationResponse();

        response.setCompanyId(savedCompany.getId());
        response.setCompanyName(savedCompany.getCompanyName());
        response.setOwnerName(savedOwner.getFullName());
        response.setOwnerEmail(savedOwner.getEmail());
        response.setOwnerMobileNumber(savedOwner.getMobileNumber());
        response.setLogoPath(savedCompany.getLogoPath());
        response.setCompanyStatus(savedCompany.getCompanyStatus());

        response.setMessage(
                "Company registration submitted successfully. "
                        + "Email verification OTP has been sent.");

        return response;
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
                    "Company logo must not exceed 2 MB");
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
                    "Only PNG, JPG and WEBP logos are allowed");
        }

        try {
            Path directory = Paths.get(
                    "static/uploads/uploads",
                    "company-logos").toAbsolutePath().normalize();

            Files.createDirectories(directory);

            String fileName = UUID.randomUUID() + extension;
            Path destination = directory.resolve(fileName).normalize();

            if (!destination.startsWith(directory)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid logo file");
            }

            Files.copy(logo.getInputStream(), destination);

            return "/static/uploads/uploads/company-logos/" + fileName;

        } catch (IOException exception) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unable to save company logo",
                    exception);
        }
    }
}
