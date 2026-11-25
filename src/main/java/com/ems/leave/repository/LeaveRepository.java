
package com.ems.leave.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ems.leave.entity.LeaveRequest;

@Repository
public interface LeaveRepository extends JpaRepository<LeaveRequest, Long> {

    List<LeaveRequest> findAllByCompanyIdOrderByAppliedOnDesc(Long companyId);

    Optional<LeaveRequest> findByIdAndCompanyId(Long id, Long companyId);

    List<LeaveRequest> findAllByCompanyIdAndEmployeeIdOrderByAppliedOnDesc(
            Long companyId, Long employeeId);

    Optional<LeaveRequest> findByIdAndEmployeeIdAndCompanyId(
            Long id, Long employeeId, Long companyId);

    List<LeaveRequest> findAllByCompanyIdAndStatusOrderByAppliedOnDesc(
            Long companyId, String status);
}
