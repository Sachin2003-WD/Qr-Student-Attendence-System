package com.mentormatrix.entity;

import com.mentormatrix.enums.NotificationType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Notification extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(length = 100)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private NotificationType type = NotificationType.SYSTEM_NOTICE;

    @Column(name = "is_read")
    private Boolean isRead = false;

    // Backward compatibility fields
    @Column(name = "recipient_email", length = 100)
    private String recipientEmail;

    @Column(name = "recipient_role", length = 20)
    private String recipientRole;

    public String getRecipientEmail() {
        return user != null ? user.getEmail() : recipientEmail;
    }

    public String getRecipientRole() {
        return user != null && user.getRole() != null ? user.getRole().name() : recipientRole;
    }

    public Boolean getRead() {
        return isRead;
    }

    public void setRead(Boolean read) {
        this.isRead = read;
    }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }
    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }

    public static NotificationBuilder builder() {
        return new NotificationBuilder();
    }

    public static class NotificationBuilder {
        private User user;
        private String title;
        private String message;
        private NotificationType type = NotificationType.SYSTEM_NOTICE;
        private Boolean isRead = false;
        private String recipientEmail;
        private String recipientRole;
        private Boolean active = true;
        private Boolean deleted = false;

        public NotificationBuilder user(User user) { this.user = user; return this; }
        public NotificationBuilder title(String title) { this.title = title; return this; }
        public NotificationBuilder message(String message) { this.message = message; return this; }
        public NotificationBuilder type(NotificationType type) { this.type = type; return this; }
        public NotificationBuilder isRead(Boolean isRead) { this.isRead = isRead; return this; }
        public NotificationBuilder recipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; return this; }
        public NotificationBuilder recipientRole(String recipientRole) { this.recipientRole = recipientRole; return this; }
        public NotificationBuilder active(Boolean active) { this.active = active; return this; }
        public NotificationBuilder deleted(Boolean deleted) { this.deleted = deleted; return this; }

        public Notification build() {
            Notification n = new Notification();
            n.setUser(user);
            n.setTitle(title);
            n.setMessage(message);
            n.setType(type != null ? type : NotificationType.SYSTEM_NOTICE);
            n.setIsRead(isRead != null ? isRead : false);
            n.recipientEmail = recipientEmail;
            n.recipientRole = recipientRole;
            n.setActive(active != null ? active : true);
            n.setDeleted(deleted != null ? deleted : false);
            return n;
        }
    }
}
