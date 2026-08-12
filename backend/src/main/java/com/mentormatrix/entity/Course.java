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
@Table(name = "courses", uniqueConstraints = {
        @UniqueConstraint(name = "uk_courses_code", columnNames = "code")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Course extends BaseEntity {

    @NotBlank(message = "Course name is required")
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank(message = "Course code is required")
    @Column(nullable = false, unique = true, length = 20)
    private String code;

    @NotNull(message = "Department is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(length = 50)
    private String duration;

    @Column(columnDefinition = "TEXT")
    private String description;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }
    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public static CourseBuilder builder() {
        return new CourseBuilder();
    }

    public static class CourseBuilder {
        private String name;
        private String code;
        private Department department;
        private String duration;
        private String description;
        private Boolean active = true;
        private Boolean deleted = false;

        public CourseBuilder name(String name) { this.name = name; return this; }
        public CourseBuilder code(String code) { this.code = code; return this; }
        public CourseBuilder department(Department department) { this.department = department; return this; }
        public CourseBuilder duration(String duration) { this.duration = duration; return this; }
        public CourseBuilder description(String description) { this.description = description; return this; }
        public CourseBuilder active(Boolean active) { this.active = active; return this; }
        public CourseBuilder deleted(Boolean deleted) { this.deleted = deleted; return this; }

        public Course build() {
            Course c = new Course();
            c.setName(name);
            c.setCode(code);
            c.setDepartment(department);
            c.setDuration(duration);
            c.setDescription(description);
            c.setActive(active != null ? active : true);
            c.setDeleted(deleted != null ? deleted : false);
            return c;
        }
    }
}
