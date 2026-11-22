
package com.ems.payslip.service;
import com.ems.payslip.dto.PayslipRequest;
import com.ems.payslip.dto.PayslipResponse;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface PayslipService {

    PayslipResponse uploadPayslip(
            Long employeeId,
            PayslipRequest request,
            MultipartFile file,
            String loggedInEmail
    ) throws IOException;

    List<PayslipResponse> getEmployeePayslips(
            Long employeeId,
            String loggedInEmail
    );

    List<PayslipResponse> getMyPayslips(
            String loggedInEmail
    );

    byte[] downloadPayslip(
            Long payslipId,
            String loggedInEmail
    ) throws IOException;

    void deletePayslip(
            Long payslipId,
            String loggedInEmail
    ) throws IOException;
}
