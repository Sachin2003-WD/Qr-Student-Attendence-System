package com.mentormatrix.entity;

import com.mentormatrix.enums.AttendanceSessionStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "attendance_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceSession extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "timetable_id")
    private Timetable timetable;

    @NotNull(message = "Faculty is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "faculty_id", nullable = false)
    private Faculty faculty;

    @NotNull(message = "Batch is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = false)
    private Batch batch;

    @NotNull(message = "Subject is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @NotNull(message = "Session date is required")
    @Column(name = "session_date", nullable = false)
    private LocalDate sessionDate;

    @NotNull(message = "Start time is required")
    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AttendanceSessionStatus status = AttendanceSessionStatus.ACTIVE;

    @Column(name = "qr_token", length = 255)
    private String qrToken;

    @Column(name = "qr_expires_at")
    private LocalDateTime qrExpiresAt;

    public Timetable getTimetable() { return timetable; }
    public void setTimetable(Timetable timetable) { this.timetable = timetable; }
    public Faculty getFaculty() { return faculty; }
    public void setFaculty(Faculty faculty) { this.faculty = faculty; }
    public Batch getBatch() { return batch; }
    public void setBatch(Batch batch) { this.batch = batch; }
    public Subject getSubject() { return subject; }
    public void setSubject(Subject subject) { this.subject = subject; }
    public LocalDate getSessionDate() { return sessionDate; }
    public void setSessionDate(LocalDate sessionDate) { this.sessionDate = sessionDate; }
    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    public AttendanceSessionStatus getStatus() { return status; }
    public void setStatus(AttendanceSessionStatus status) { this.status = status; }
    public String getQrToken() { return qrToken; }
    public void setQrToken(String qrToken) { this.qrToken = qrToken; }
    public LocalDateTime getQrExpiresAt() { return qrExpiresAt; }
    public void setQrExpiresAt(LocalDateTime qrExpiresAt) { this.qrExpiresAt = qrExpiresAt; }

    public static AttendanceSessionBuilder builder() {
        return new AttendanceSessionBuilder();
    }

    public static class AttendanceSessionBuilder {
        private Timetable timetable;
        private Faculty faculty;
        private Batch batch;
        private Subject subject;
        private LocalDate sessionDate;
        private LocalTime startTime;
        private LocalTime endTime;
        private AttendanceSessionStatus status = AttendanceSessionStatus.ACTIVE;
        private String qrToken;
        private LocalDateTime qrExpiresAt;
        private Boolean active = true;
        private Boolean deleted = false;

        public AttendanceSessionBuilder timetable(Timetable timetable) { this.timetable = timetable; return this; }
        public AttendanceSessionBuilder faculty(Faculty faculty) { this.faculty = faculty; return this; }
        public AttendanceSessionBuilder batch(Batch batch) { this.batch = batch; return this; }
        public AttendanceSessionBuilder subject(Subject subject) { this.subject = subject; return this; }
        public AttendanceSessionBuilder sessionDate(LocalDate sessionDate) { this.sessionDate = sessionDate; return this; }
        public AttendanceSessionBuilder startTime(LocalTime startTime) { this.startTime = startTime; return this; }
        public AttendanceSessionBuilder endTime(LocalTime endTime) { this.endTime = endTime; return this; }
        public AttendanceSessionBuilder status(AttendanceSessionStatus status) { this.status = status; return this; }
        public AttendanceSessionBuilder qrToken(String qrToken) { this.qrToken = qrToken; return this; }
        public AttendanceSessionBuilder qrExpiresAt(LocalDateTime qrExpiresAt) { this.qrExpiresAt = qrExpiresAt; return this; }
        public AttendanceSessionBuilder active(Boolean active) { this.active = active; return this; }
        public AttendanceSessionBuilder deleted(Boolean deleted) { this.deleted = deleted; return this; }

        public AttendanceSession build() {
            AttendanceSession s = new AttendanceSession();
            s.setTimetable(timetable);
            s.setFaculty(faculty);
            s.setBatch(batch);
            s.setSubject(subject);
            s.setSessionDate(sessionDate);
            s.setStartTime(startTime);
            s.setEndTime(endTime);
            s.setStatus(status != null ? status : AttendanceSessionStatus.ACTIVE);
            s.setQrToken(qrToken);
            s.setQrExpiresAt(qrExpiresAt);
            s.setActive(active != null ? active : true);
            s.setDeleted(deleted != null ? deleted : false);
            return s;
        }
    }
}
