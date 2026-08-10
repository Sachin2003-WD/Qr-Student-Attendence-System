package com.mentormatrix.entity;

import jakarta.persistence.Column;
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

    @Column(name = "name", length = 100)
    private String name;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "password", length = 255)
    private String password;

    public String getName() {
        return name != null ? name : (user != null ? user.getName() : null);
    }

    public String getEmail() {
        return email != null ? email : (user != null ? user.getEmail() : null);
    }

    public String getPhone() {
        return phone != null ? phone : (user != null ? user.getPhone() : null);
    }

    public String getPassword() {
        return password != null ? password : (user != null ? user.getPassword() : null);
    }

    public void setName(String name) {
        this.name = name;
        if (user != null) user.setName(name);
    }

    public void setEmail(String email) {
        this.email = email;
        if (user != null) user.setEmail(email);
    }

    public void setPhone(String phone) {
        this.phone = phone;
        if (user != null) user.setPhone(phone);
    }

    public void setPassword(String password) {
        this.password = password;
        if (user != null) user.setPassword(password);
    }
}
