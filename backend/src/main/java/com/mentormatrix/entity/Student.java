package com.mentormatrix.entity;

import com.mentormatrix.enums.Gender;
import com.mentormatrix.enums.StudentStatus;
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

import java.time.LocalDate;

@Entity
@Table(name = "students", uniqueConstraints = {
        @UniqueConstraint(name = "uk_students_student_id", columnNames = "student_id")
})
@SuperBuilder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Student extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @NotBlank(message = "Student ID is required")
    @Column(name = "student_id", nullable = false, unique = true, length = 50)
    private String studentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id")
    private Batch batch;

    @Column
    private Integer semester;

    @Column(length = 10)
    private String section;

    @Column(length = 100)
    private String college;

    @Column(length = 100)
    private String university;

    @Column(name = "year_of_passing")
    private Integer yearOfPassing;

    @Column(name = "profile_image", length = 255)
    private String profileImage;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(columnDefinition = "TEXT")
    private String interests;

    @Column(columnDefinition = "TEXT")
    private String skills;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Gender gender;

    @Column(name = "dob")
    private LocalDate dob;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StudentStatus status = StudentStatus.ACTIVE;

    // Helper delegate methods for backward compatibility
    public String getUsn() {
        return studentId;
    }

    public void setUsn(String usn) {
        this.studentId = usn;
    }

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
