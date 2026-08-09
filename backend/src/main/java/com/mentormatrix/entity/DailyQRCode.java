package com.mentormatrix.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "daily_qr_codes", uniqueConstraints = {
        @UniqueConstraint(columnNames = "token")
})
@SuperBuilder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DailyQRCode extends BaseEntity {

    @Column(nullable = false, unique = true, length = 255)
    private String token;

    @Column(name = "qr_code_base64", columnDefinition = "LONGTEXT", nullable = false)
    private String qrCodeBase64;

    @Column(name = "date")
    private LocalDate date;

    @Column(name = "generated_by", length = 100)
    private String generatedBy;

    @Column(name = "user_email", length = 100)
    private String userEmail;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;
}
