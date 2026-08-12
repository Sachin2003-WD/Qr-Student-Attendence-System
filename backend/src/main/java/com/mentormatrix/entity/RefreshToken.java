package com.mentormatrix.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Table(name = "refresh_tokens", uniqueConstraints = {
        @UniqueConstraint(name = "uk_refresh_tokens_token", columnNames = "token")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RefreshToken extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @NotBlank(message = "Token is required")
    @Column(nullable = false, unique = true, length = 255)
    private String token;

    @NotNull(message = "Expiry date is required")
    @Column(name = "expiry_date", nullable = false)
    private LocalDateTime expiryDate;

    @Column(nullable = false)
    private Boolean revoked = false;

    // Backward compatibility for email-based refresh lookup
    @Column(name = "user_email", length = 100)
    private String userEmail;

    @Column(name = "user_role", length = 20)
    private String userRole;

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public LocalDateTime getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDateTime expiryDate) { this.expiryDate = expiryDate; }
    public Boolean getRevoked() { return revoked; }
    public void setRevoked(Boolean revoked) { this.revoked = revoked; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public String getUserRole() { return userRole; }
    public void setUserRole(String userRole) { this.userRole = userRole; }

    public static RefreshTokenBuilder builder() {
        return new RefreshTokenBuilder();
    }

    public static class RefreshTokenBuilder {
        private User user;
        private String token;
        private LocalDateTime expiryDate;
        private Boolean revoked = false;
        private String userEmail;
        private String userRole;
        private Boolean active = true;
        private Boolean deleted = false;

        public RefreshTokenBuilder user(User user) { this.user = user; return this; }
        public RefreshTokenBuilder token(String token) { this.token = token; return this; }
        public RefreshTokenBuilder expiryDate(LocalDateTime expiryDate) { this.expiryDate = expiryDate; return this; }
        public RefreshTokenBuilder revoked(Boolean revoked) { this.revoked = revoked; return this; }
        public RefreshTokenBuilder userEmail(String userEmail) { this.userEmail = userEmail; return this; }
        public RefreshTokenBuilder userRole(String userRole) { this.userRole = userRole; return this; }
        public RefreshTokenBuilder active(Boolean active) { this.active = active; return this; }
        public RefreshTokenBuilder deleted(Boolean deleted) { this.deleted = deleted; return this; }

        public RefreshToken build() {
            RefreshToken r = new RefreshToken();
            r.setUser(user);
            r.setToken(token);
            r.setExpiryDate(expiryDate);
            r.setRevoked(revoked != null ? revoked : false);
            r.setUserEmail(userEmail);
            r.setUserRole(userRole);
            r.setActive(active != null ? active : true);
            r.setDeleted(deleted != null ? deleted : false);
            return r;
        }
    }
}
