
package com.ems.company.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CompanyRegistrationResponse {

  private Long companyId;

  private String companyName;

  private String ownerEmail;

  private String companyStatus;

  private String message;
}
