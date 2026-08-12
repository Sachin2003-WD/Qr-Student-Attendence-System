package com.mentormatrix.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QRCodeResponse {
    private LocalDate date;
    private String token;
    private String qrCodeBase64;
    private LocalDateTime expiresAt;
    private String userEmail;

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getQrCodeBase64() { return qrCodeBase64; }
    public void setQrCodeBase64(String qrCodeBase64) { this.qrCodeBase64 = qrCodeBase64; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public static QRCodeResponseBuilder builder() {
        return new QRCodeResponseBuilder();
    }

    public static class QRCodeResponseBuilder {
        private LocalDate date;
        private String token;
        private String qrCodeBase64;
        private LocalDateTime expiresAt;
        private String userEmail;

        public QRCodeResponseBuilder date(LocalDate date) { this.date = date; return this; }
        public QRCodeResponseBuilder token(String token) { this.token = token; return this; }
        public QRCodeResponseBuilder qrCodeBase64(String qrCodeBase64) { this.qrCodeBase64 = qrCodeBase64; return this; }
        public QRCodeResponseBuilder expiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; return this; }
        public QRCodeResponseBuilder userEmail(String userEmail) { this.userEmail = userEmail; return this; }

        public QRCodeResponse build() {
            QRCodeResponse r = new QRCodeResponse();
            r.setDate(date);
            r.setToken(token);
            r.setQrCodeBase64(qrCodeBase64);
            r.setExpiresAt(expiresAt);
            r.setUserEmail(userEmail);
            return r;
        }
    }
}
