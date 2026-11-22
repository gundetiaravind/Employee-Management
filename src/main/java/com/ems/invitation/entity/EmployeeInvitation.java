
package com.ems.invitation.entity;

import com.ems.common.enums.Role;
import com.ems.user.entity.User;

import jakarta.persistence.*;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employee_invitations", indexes = {
    @Index(name = "idx_invitation_token_hash", columnList = "token_hash", unique = true),
    @Index(name = "idx_invitation_company_email", columnList = "company_id, email"),
    @Index(name = "idx_invitation_company_status", columnList = "company_id, invitation_status"),
    @Index(name = "idx_invitation_status_expiry", columnList = "invitation_status, expires_at")
})
@Getter
@Setter
@NoArgsConstructor
public class EmployeeInvitation {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // Company information
  @Column(name = "company_id", nullable = false)
  private Long companyId;

  // Owner or Admin who sent the invitation
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "invited_by_user_id", nullable = false)
  private User invitedBy;

  // Role assigned through this invitation
  @Enumerated(EnumType.STRING)
  @Column(name = "invited_role", nullable = false, length = 30)
  private Role invitedRole;

  // Employee details (employment code is optional for Admin invitations)
  @Column(name = "employment_code", length = 20)
  private String employmentCode;

  @Column(name = "employee_name", nullable = false, length = 150)
  private String employeeName;

  @Column(name = "email", nullable = false, length = 150)
  private String email;

  @Column(name = "phone", length = 20)
  private String phone;

  @Column(name = "department", length = 100)
  private String department;

  @Column(name = "designation", length = 100)
  private String designation;

  @Column(name = "manager_name", length = 150)
  private String managerName;

  @Column(name = "date_of_joining")
  private LocalDate dateOfJoining;

  // Store only the hashed invitation token
  @Column(name = "token_hash", nullable = false, unique = true, length = 64)
  private String tokenHash;

  // Invitation expiration
  @Column(name = "expires_at", nullable = false)
  private LocalDateTime expiresAt;

  @Column(name = "accepted_at")
  private LocalDateTime acceptedAt;

  // Invitation status
  @Enumerated(EnumType.STRING)
  @Column(name = "invitation_status", nullable = false, length = 20)
  private EmployeeInvitationStatus invitationStatus;

  // Audit timestamps
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @PrePersist
  protected void onCreate() {

    LocalDateTime now = LocalDateTime.now();

    createdAt = now;
    updatedAt = now;

    if (invitationStatus == null) {
      invitationStatus = EmployeeInvitationStatus.PENDING;
    }
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}
