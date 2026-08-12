package com.mentormatrix.entity;

import com.mentormatrix.enums.EnrollmentStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;

@Entity
@Table(name = "enrollments", uniqueConstraints = {
        @UniqueConstraint(name = "uk_enrollment_student_batch", columnNames = {"student_id", "batch_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Enrollment extends BaseEntity {

    @NotNull(message = "Student is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @NotNull(message = "Batch is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = false)
    private Batch batch;

    @Column(name = "enrollment_date", nullable = false)
    private LocalDate enrollmentDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EnrollmentStatus status = EnrollmentStatus.ACTIVE;

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
    public Batch getBatch() { return batch; }
    public void setBatch(Batch batch) { this.batch = batch; }
    public LocalDate getEnrollmentDate() { return enrollmentDate; }
    public void setEnrollmentDate(LocalDate enrollmentDate) { this.enrollmentDate = enrollmentDate; }
    public EnrollmentStatus getStatus() { return status; }
    public void setStatus(EnrollmentStatus status) { this.status = status; }

    public static EnrollmentBuilder builder() {
        return new EnrollmentBuilder();
    }

    public static class EnrollmentBuilder {
        private Student student;
        private Batch batch;
        private LocalDate enrollmentDate;
        private EnrollmentStatus status = EnrollmentStatus.ACTIVE;
        private Boolean active = true;
        private Boolean deleted = false;

        public EnrollmentBuilder student(Student student) { this.student = student; return this; }
        public EnrollmentBuilder batch(Batch batch) { this.batch = batch; return this; }
        public EnrollmentBuilder enrollmentDate(LocalDate enrollmentDate) { this.enrollmentDate = enrollmentDate; return this; }
        public EnrollmentBuilder status(EnrollmentStatus status) { this.status = status; return this; }
        public EnrollmentBuilder active(Boolean active) { this.active = active; return this; }
        public EnrollmentBuilder deleted(Boolean deleted) { this.deleted = deleted; return this; }

        public Enrollment build() {
            Enrollment e = new Enrollment();
            e.setStudent(student);
            e.setBatch(batch);
            e.setEnrollmentDate(enrollmentDate);
            e.setStatus(status != null ? status : EnrollmentStatus.ACTIVE);
            e.setActive(active != null ? active : true);
            e.setDeleted(deleted != null ? deleted : false);
            return e;
        }
    }
}
