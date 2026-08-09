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
@SuperBuilder
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

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private NotificationType type = NotificationType.SYSTEM_NOTICE;

    @Builder.Default
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
}
