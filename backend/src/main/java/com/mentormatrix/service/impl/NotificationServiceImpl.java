package com.mentormatrix.service.impl;

import com.mentormatrix.dto.response.NotificationResponse;
import com.mentormatrix.entity.Notification;
import com.mentormatrix.exception.ResourceNotFoundException;
import com.mentormatrix.repository.NotificationRepository;
import com.mentormatrix.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public void createNotification(String recipientEmail, String recipientRole, String title, String message) {
        log.info("Creating notification for {} (Role: {}): {}", recipientEmail, recipientRole, title);
        Notification notification = Notification.builder()
                .recipientEmail(recipientEmail)
                .recipientRole(recipientRole)
                .title(title)
                .message(message)
                .isRead(false)
                .active(true)
                .deleted(false)
                .build();
        notificationRepository.save(notification);
    }

    @Override
    public List<NotificationResponse> getNotifications(String email) {
        log.info("Fetching notifications for {}", email);
        List<Notification> notifications = notificationRepository.findByRecipientEmailAndDeletedFalseOrderByCreatedAtDesc(email);
        return notifications.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<NotificationResponse> getUnreadNotifications(String email) {
        log.info("Fetching unread notifications for {}", email);
        List<Notification> notifications = notificationRepository.findByRecipientEmailAndIsReadFalseAndDeletedFalseOrderByCreatedAtDesc(email);
        return notifications.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public long getUnreadCount(String email) {
        return notificationRepository.countByRecipientEmailAndIsReadFalseAndDeletedFalse(email);
    }

    @Override
    @Transactional
    public void markAsRead(Long id) {
        log.info("Marking notification {} as read", id);
        Notification notification = notificationRepository.findById(id)
                .filter(n -> !n.getDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(String email) {
        log.info("Marking all notifications as read for {}", email);
        List<Notification> notifications = notificationRepository.findByRecipientEmailAndIsReadFalseAndDeletedFalseOrderByCreatedAtDesc(email);
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
    }

    private NotificationResponse mapToResponse(Notification notification) {
        NotificationResponse response = modelMapper.map(notification, NotificationResponse.class);
        response.setRead(notification.getIsRead() != null ? notification.getIsRead() : false);
        return response;
    }
}
