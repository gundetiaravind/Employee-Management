package com.ems.platformmanager.dto;

import java.time.LocalDateTime;

public record CompanyManagementResponse(

        Long companyId,
        String companyName,
        String companyEmail,
        String companyCode,
        String registrationNumber,
        String companyType,
        String industry,
        String companyPhone,
        String alternatePhone,
        String companyWebsite,
        String country,
        String state,
        String city,
        String pinCode,
        String companyAddress,
        String logoPath,
        String companyStatus,
        LocalDateTime createdAt,

        Long ownerId,
        String ownerName,
        String ownerEmail,
        String ownerMobileNumber,
        boolean ownerEmailVerified,
        String ownerAccountStatus

) {
}