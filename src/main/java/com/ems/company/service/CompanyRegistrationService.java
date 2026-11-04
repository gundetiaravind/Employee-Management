
package com.ems.company.service;

import com.ems.company.dto.CompanyRegistrationRequest;
import com.ems.company.dto.CompanyRegistrationResponse;

public interface CompanyRegistrationService {

    CompanyRegistrationResponse registerCompany(
            CompanyRegistrationRequest request
    );
}
