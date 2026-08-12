package com.mentormatrix.entity;

import com.mentormatrix.enums.FacultyStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "faculty", uniqueConstraints = {
        @UniqueConstraint(name = "uk_faculty_faculty_id", columnNames = "faculty_id")
})
@SuperBuilder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Faculty extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @NotBlank(message = "Faculty ID is required")
    @Column(name = "faculty_id", nullable = false, unique = true, length = 50)
    private String facultyId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(length = 100)
    private String designation;

    @Column(length = 100)
    private String qualification;

    @Column(length = 100)
    private String specialization;

    @Column(length = 50)
    private String experience;

    @Column(name = "profile_image", length = 255)
    private String profileImage;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private FacultyStatus status = FacultyStatus.ACTIVE;

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getFacultyId() { return facultyId; }
    public void setFacultyId(String facultyId) { this.facultyId = facultyId; }
    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }
    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getName() {
        return user != null ? user.getName() : "Faculty Member";
    }

    public String getEmail() {
        return user != null ? user.getEmail() : null;
    }
}
