
package com.ems.company.controller;

import com.ems.company.dto.CompanyRegistrationRequest;
import com.ems.company.dto.CompanyRegistrationResponse;
import com.ems.company.service.CompanyRegistrationService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class CompanyRegistrationController {

    private final CompanyRegistrationService registrationService;

    public CompanyRegistrationController(
            CompanyRegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @PostMapping(
            value = "/register",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<CompanyRegistrationResponse> registerCompany(
            @Valid @ModelAttribute CompanyRegistrationRequest request) {

        CompanyRegistrationResponse response =
                registrationService.registerCompany(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
}
