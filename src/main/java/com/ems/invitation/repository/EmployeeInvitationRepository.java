
package com.ems.invitation.repository;

import com.ems.invitation.entity.EmployeeInvitation;
import com.ems.invitation.entity.EmployeeInvitationStatus;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeInvitationRepository
    extends JpaRepository<EmployeeInvitation, Long> {

  // Find invitation using secure token hash
  Optional<EmployeeInvitation> findByTokenHash(String tokenHash);

  // Find and lock invitation during registration
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("SELECT i FROM EmployeeInvitation i WHERE i.tokenHash = :tokenHash")
  Optional<EmployeeInvitation> findByTokenHashForUpdate(
      @Param("tokenHash") String tokenHash);

  // Check whether an invitation already exists for this email
  boolean existsByCompanyIdAndEmailAndInvitationStatus(
      Long companyId,
      String email,
      EmployeeInvitationStatus invitationStatus);

  // Find all invitations belonging to a company
  List<EmployeeInvitation> findByCompanyIdOrderByCreatedAtDesc(
      Long companyId);

  // Find invitations by company and email
  List<EmployeeInvitation> findByCompanyIdAndEmailIgnoreCase(
      Long companyId,
      String email);

  // Find pending invitations that have expired
  List<EmployeeInvitation> findByInvitationStatusAndExpiresAtBefore(
      EmployeeInvitationStatus invitationStatus,
      LocalDateTime currentTime);

  // Find invitation belonging to a particular company
  Optional<EmployeeInvitation> findByIdAndCompanyId(
      Long id,
      Long companyId);

  // Check whether an employment code already has a pending invitation
  boolean existsByCompanyIdAndEmploymentCodeAndInvitationStatus(
      Long companyId,
      String employmentCode,
      EmployeeInvitationStatus invitationStatus);
}
