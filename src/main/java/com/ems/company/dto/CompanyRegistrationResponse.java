
package com.ems.company.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CompanyRegistrationResponse {

    private Long companyId;
    private String companyName;
    private String ownerName;
    private String ownerEmail;
    private String ownerMobileNumber;
    private String logoPath;
    private String companyStatus;
    private String message;
}
