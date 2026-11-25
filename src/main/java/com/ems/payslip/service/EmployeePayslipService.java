package com.ems.payslip.service;

import com.ems.payslip.dto.EmployeePayslipResponse;

import java.util.List;

public interface EmployeePayslipService {

    EmployeePayslipResponse getPayslipById(Long payslipId, String email);

    List<EmployeePayslipResponse> getMyPayslips(String email);

}