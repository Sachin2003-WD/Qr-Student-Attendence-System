package com.mentormatrix.repository;

import com.mentormatrix.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientEmailAndDeletedFalseOrderByCreatedAtDesc(String recipientEmail);
    List<Notification> findByRecipientEmailAndIsReadFalseAndDeletedFalseOrderByCreatedAtDesc(String recipientEmail);
    long countByRecipientEmailAndIsReadFalseAndDeletedFalse(String recipientEmail);
}
