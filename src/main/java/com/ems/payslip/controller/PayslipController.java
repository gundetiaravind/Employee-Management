
package com.ems.payslip.controller;

import com.ems.payslip.dto.PayslipRequest;
import com.ems.payslip.dto.PayslipResponse;
import com.ems.payslip.service.PayslipService;

import jakarta.validation.Valid;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
public class PayslipController {

    private final PayslipService payslipService;

    public PayslipController(PayslipService payslipService) {
        this.payslipService = payslipService;
    }

    // Admin: Upload employee payslip
    @PostMapping(
            value = "/employees/{id}/payslips",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<PayslipResponse> uploadPayslip(
            @PathVariable Long id,
            @Valid @ModelAttribute PayslipRequest request,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws IOException {

        PayslipResponse response = payslipService.uploadPayslip(
                id, request, file, authentication.getName());

        return ResponseEntity.ok(response);
    }

    // Admin: View payslips of an employee
    @GetMapping("/employees/{id}/payslips")
    public ResponseEntity<List<PayslipResponse>> getEmployeePayslips(
            @PathVariable Long id,
            Authentication authentication) {

        return ResponseEntity.ok(
                payslipService.getEmployeePayslips(id, authentication.getName()));
    }

    // Employee: View own payslips
    @GetMapping("/employees/me/payslips")
    public ResponseEntity<List<PayslipResponse>> getMyPayslips(
            Authentication authentication) {

        return ResponseEntity.ok(
                payslipService.getMyPayslips(authentication.getName()));
    }

    // Admin or employee: Download authorized payslip
    @GetMapping("/payslips/{id}/download")
    public ResponseEntity<byte[]> downloadPayslip(
            @PathVariable Long id,
            Authentication authentication) throws IOException {

        byte[] file = payslipService.downloadPayslip(
                id, authentication.getName());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(
                ContentDisposition.attachment()
                        .filename("payslip-" + id + ".pdf")
                        .build());

        return ResponseEntity.ok()
                .headers(headers)
                .contentLength(file.length)
                .body(file);
    }

    // Admin: Delete payslip
    @DeleteMapping("/payslips/{id}")
    public ResponseEntity<Void> deletePayslip(
            @PathVariable Long id,
            Authentication authentication) throws IOException {

        payslipService.deletePayslip(id, authentication.getName());

        return ResponseEntity.noContent().build();
    }
}
