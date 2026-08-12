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

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getQrCodeBase64() { return qrCodeBase64; }
    public void setQrCodeBase64(String qrCodeBase64) { this.qrCodeBase64 = qrCodeBase64; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public String getGeneratedBy() { return generatedBy; }
    public void setGeneratedBy(String generatedBy) { this.generatedBy = generatedBy; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public static DailyQRCodeBuilder builder() {
        return new DailyQRCodeBuilder();
    }

    public static class DailyQRCodeBuilder {
        private String token;
        private String qrCodeBase64;
        private LocalDate date;
        private String generatedBy;
        private String userEmail;
        private LocalDateTime expiresAt;
        private Boolean active = true;
        private Boolean deleted = false;

        public DailyQRCodeBuilder token(String token) { this.token = token; return this; }
        public DailyQRCodeBuilder qrCodeBase64(String qrCodeBase64) { this.qrCodeBase64 = qrCodeBase64; return this; }
        public DailyQRCodeBuilder date(LocalDate date) { this.date = date; return this; }
        public DailyQRCodeBuilder generatedBy(String generatedBy) { this.generatedBy = generatedBy; return this; }
        public DailyQRCodeBuilder userEmail(String userEmail) { this.userEmail = userEmail; return this; }
        public DailyQRCodeBuilder expiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; return this; }
        public DailyQRCodeBuilder active(Boolean active) { this.active = active; return this; }
        public DailyQRCodeBuilder deleted(Boolean deleted) { this.deleted = deleted; return this; }

        public DailyQRCode build() {
            DailyQRCode qr = new DailyQRCode();
            qr.setToken(token);
            qr.setQrCodeBase64(qrCodeBase64);
            qr.setDate(date);
            qr.setGeneratedBy(generatedBy);
            qr.setUserEmail(userEmail);
            qr.setExpiresAt(expiresAt);
            qr.setActive(active != null ? active : true);
            qr.setDeleted(deleted != null ? deleted : false);
            return qr;
        }
    }
}
