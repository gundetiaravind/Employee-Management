
package com.ems.finance.mapper;

import org.springframework.stereotype.Component;

import com.ems.finance.entity.EmployeeFinance;
import com.ems.finance.entity.EmployeeCtc;
import com.ems.finance.dto.FinanceResponse;
import com.ems.finance.dto.CtcResponse;

@Component
public class FinanceMapper {

    // Convert EmployeeFinance entity to FinanceResponse

    public FinanceResponse toFinanceResponse(EmployeeFinance finance) {

        FinanceResponse response = new FinanceResponse();

        response.setId(finance.getId());

        response.setPanNumber(maskPan(finance.getPanNumber()));
        response.setAadhaarNumber(maskAadhaar(finance.getAadhaarNumber()));

        response.setBankName(finance.getBankName());
        response.setBranchName(finance.getBranchName());
        response.setIfscCode(finance.getIfscCode());

        return response;
    }

    // Convert EmployeeCtc entity to CtcResponse

    public CtcResponse toCtcResponse(EmployeeCtc ctc) {

        CtcResponse response = new CtcResponse();

        response.setId(ctc.getId());

        response.setTotalAnnualCtc(ctc.getTotalAnnualCtc());
        response.setBasicSalary(ctc.getBasicSalary());
        response.setHra(ctc.getHra());
        response.setSpecialAllowance(ctc.getSpecialAllowance());
        response.setOtherAllowances(ctc.getOtherAllowances());

        return response;
    }

    // Mask PAN number

    private String maskPan(String pan) {

        if (pan == null || pan.length() != 10) {
            return "**********";
        }

        return pan.substring(0, 3) + "****" + pan.substring(7);
    }

    // Mask Aadhaar number

    private String maskAadhaar(String aadhaar) {

        if (aadhaar == null || aadhaar.length() != 12) {
            return "************";
        }

        return "********" + aadhaar.substring(8);
    }
}
