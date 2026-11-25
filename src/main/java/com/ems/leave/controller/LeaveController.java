
package com.ems.leave.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ems.leave.dto.LeaveDecisionRequest;
import com.ems.leave.dto.LeaveResponse;
import com.ems.leave.service.LeaveService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/leaves")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    @GetMapping
    public ResponseEntity<List<LeaveResponse>> getAllLeaves(
            @RequestParam(required = false) String status) {

        if (status == null || status.trim().isEmpty()) {
            return ResponseEntity.ok(leaveService.getAllLeaves());
        }

        return ResponseEntity.ok(
                leaveService.getLeavesByStatus(status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LeaveResponse> getLeaveById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                leaveService.getLeaveById(id));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<LeaveResponse> approveLeave(
            @PathVariable Long id,
            @Valid @RequestBody(required = false)
            LeaveDecisionRequest request) {

        return ResponseEntity.ok(
                leaveService.approveLeave(id, request));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<LeaveResponse> rejectLeave(
            @PathVariable Long id,
            @Valid @RequestBody(required = false)
            LeaveDecisionRequest request) {

        return ResponseEntity.ok(
                leaveService.rejectLeave(id, request));
    }
}
