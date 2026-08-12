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

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StudentStatus status = StudentStatus.ACTIVE;

    @Column(name = "name", length = 100)
    private String name;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "password", length = 255)
    private String password;

    // Helper delegate methods for backward compatibility
    public String getUsn() {
        return studentId;
    }

    public void setUsn(String usn) {
        this.studentId = usn;
    }

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

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }
    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }
    public Batch getBatch() { return batch; }
    public void setBatch(Batch batch) { this.batch = batch; }
    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }
    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }
    public StudentStatus getStatus() { return status; }
    public void setStatus(StudentStatus status) { this.status = status; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getInterests() { return interests; }
    public void setInterests(String interests) { this.interests = interests; }
    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }
    public String getProfileImage() { return profileImage; }
    public void setProfileImage(String profileImage) { this.profileImage = profileImage; }

    public static StudentBuilder builder() {
        return new StudentBuilder();
    }

    public static class StudentBuilder {
        private User user;
        private String studentId;
        private Department department;
        private Course course;
        private Batch batch;
        private Integer semester;
        private String section;
        private StudentStatus status = StudentStatus.ACTIVE;
        private Gender gender;
        private LocalDate dob;
        private String address;
        private String profileImage;
        private String interests;
        private String skills;
        private String name;
        private String email;
        private String phone;
        private String password;
        private Boolean active = true;
        private Boolean deleted = false;

        public StudentBuilder user(User user) { this.user = user; return this; }
        public StudentBuilder studentId(String studentId) { this.studentId = studentId; return this; }
        public StudentBuilder department(Department department) { this.department = department; return this; }
        public StudentBuilder course(Course course) { this.course = course; return this; }
        public StudentBuilder batch(Batch batch) { this.batch = batch; return this; }
        public StudentBuilder semester(Integer semester) { this.semester = semester; return this; }
        public StudentBuilder section(String section) { this.section = section; return this; }
        public StudentBuilder status(StudentStatus status) { this.status = status; return this; }
        public StudentBuilder gender(Gender gender) { this.gender = gender; return this; }
        public StudentBuilder dob(LocalDate dob) { this.dob = dob; return this; }
        public StudentBuilder address(String address) { this.address = address; return this; }
        public StudentBuilder profileImage(String profileImage) { this.profileImage = profileImage; return this; }
        public StudentBuilder interests(String interests) { this.interests = interests; return this; }
        public StudentBuilder skills(String skills) { this.skills = skills; return this; }
        public StudentBuilder name(String name) { this.name = name; return this; }
        public StudentBuilder email(String email) { this.email = email; return this; }
        public StudentBuilder phone(String phone) { this.phone = phone; return this; }
        public StudentBuilder password(String password) { this.password = password; return this; }
        public StudentBuilder active(Boolean active) { this.active = active; return this; }
        public StudentBuilder deleted(Boolean deleted) { this.deleted = deleted; return this; }

        public Student build() {
            Student s = new Student();
            s.setUser(user);
            s.setStudentId(studentId);
            s.setDepartment(department);
            s.setCourse(course);
            s.setBatch(batch);
            s.setSemester(semester);
            s.setSection(section);
            s.setStatus(status != null ? status : StudentStatus.ACTIVE);
            s.setGender(gender);
            s.setDob(dob);
            s.setAddress(address);
            s.setProfileImage(profileImage);
            s.setInterests(interests);
            s.setSkills(skills);
            s.setName(name);
            s.setEmail(email);
            s.setPhone(phone);
            s.setPassword(password);
            s.setActive(active != null ? active : true);
            s.setDeleted(deleted != null ? deleted : false);
            return s;
        }
    }
}
