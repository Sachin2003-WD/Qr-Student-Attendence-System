package com.mentormatrix.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "admins")
@SuperBuilder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Admin extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    public String getName() {
        return user != null ? user.getName() : null;
    }

    public String getEmail() {
        return user != null ? user.getEmail() : null;
    }

    public String getPhone() {
        return user != null ? user.getPhone() : null;
    }

    public String getPassword() {
        return user != null ? user.getPassword() : null;
    }

    public void setName(String name) {
        if (user != null) user.setName(name);
    }

    public void setEmail(String email) {
        if (user != null) user.setEmail(email);
    }

    public void setPhone(String phone) {
        if (user != null) user.setPhone(phone);
    }

    public void setPassword(String password) {
        if (user != null) user.setPassword(password);
    }
}
