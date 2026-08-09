package com.mentormatrix.service;

import com.mentormatrix.dto.response.NotificationResponse;
import java.util.List;

public interface NotificationService {
    void createNotification(String recipientEmail, String recipientRole, String title, String message);
    List<NotificationResponse> getNotifications(String email);
    List<NotificationResponse> getUnreadNotifications(String email);
    long getUnreadCount(String email);
    void markAsRead(Long notificationId);
    void markAllAsRead(String email);
}
