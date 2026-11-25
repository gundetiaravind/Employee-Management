
package com.ems.leave.service;

import java.util.List;

import com.ems.leave.dto.LeaveApplicationRequest;
import com.ems.leave.dto.LeaveDecisionRequest;
import com.ems.leave.dto.LeaveResponse;

public interface LeaveService {

    List<LeaveResponse> getAllLeaves();

    List<LeaveResponse> getLeavesByStatus(String status);

    LeaveResponse getLeaveById(Long id);

    LeaveResponse approveLeave(
            Long id, LeaveDecisionRequest request);

    LeaveResponse rejectLeave(
            Long id, LeaveDecisionRequest request);

    List<LeaveResponse> getMyLeaves(String email);

    LeaveResponse applyForLeave(
            String email, LeaveApplicationRequest request);

    void cancelMyLeave(String email, Long id);
}
