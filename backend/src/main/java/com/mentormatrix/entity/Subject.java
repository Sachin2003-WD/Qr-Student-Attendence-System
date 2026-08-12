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
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "subjects", uniqueConstraints = {
        @UniqueConstraint(name = "uk_subjects_code", columnNames = "code")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Subject extends BaseEntity {

    @NotBlank(message = "Subject name is required")
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank(message = "Subject code is required")
    @Column(nullable = false, unique = true, length = 20)
    private String code;

    @NotNull(message = "Course is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false)
    private Integer semester;

    @Column(nullable = false)
    private Integer credits;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }
    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }
    public Integer getCredits() { return credits; }
    public void setCredits(Integer credits) { this.credits = credits; }

    public static SubjectBuilder builder() {
        return new SubjectBuilder();
    }

    public static class SubjectBuilder {
        private String name;
        private String code;
        private Course course;
        private Integer semester;
        private Integer credits;
        private Boolean active = true;
        private Boolean deleted = false;

        public SubjectBuilder name(String name) { this.name = name; return this; }
        public SubjectBuilder code(String code) { this.code = code; return this; }
        public SubjectBuilder course(Course course) { this.course = course; return this; }
        public SubjectBuilder semester(Integer semester) { this.semester = semester; return this; }
        public SubjectBuilder credits(Integer credits) { this.credits = credits; return this; }
        public SubjectBuilder active(Boolean active) { this.active = active; return this; }
        public SubjectBuilder deleted(Boolean deleted) { this.deleted = deleted; return this; }

        public Subject build() {
            Subject s = new Subject();
            s.setName(name);
            s.setCode(code);
            s.setCourse(course);
            s.setSemester(semester);
            s.setCredits(credits);
            s.setActive(active != null ? active : true);
            s.setDeleted(deleted != null ? deleted : false);
            return s;
        }
    }
}
