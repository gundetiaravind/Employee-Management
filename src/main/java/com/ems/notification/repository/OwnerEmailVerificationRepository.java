
package com.ems.notification.repository;

import com.ems.notification.entity.OwnerEmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OwnerEmailVerificationRepository
        extends JpaRepository<OwnerEmailVerification, Long> {

    Optional<OwnerEmailVerification> findByUser_Id(Long userId);

    void deleteByUser_Id(Long userId);
}
