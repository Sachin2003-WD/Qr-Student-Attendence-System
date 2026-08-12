package com.mentormatrix.entity;

import com.mentormatrix.enums.AttendanceStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
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
@Table(name = "attendances", uniqueConstraints = {
        @UniqueConstraint(name = "uk_attendance_student_session", columnNames = {"student_id", "attendance_session_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Attendance extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attendance_session_id")
    private AttendanceSession attendanceSession;

    @Column(name = "attendance_date")
    private LocalDate attendanceDate;

    @Column(name = "attendance_time")
    private LocalTime attendanceTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AttendanceStatus status;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    // Backward compatibility fields
    @Column(name = "user_email", length = 100)
    private String userEmail;

    @Column(name = "user_name", length = 100)
    private String userName;

    @Column(name = "user_role", length = 20)
    private String userRole;

    @Column(name = "date")
    private LocalDate date;

    @Column(name = "marked_at")
    private LocalDateTime markedAt;

    @Column(name = "recorded_by_faculty_email", length = 100)
    private String recordedByFacultyEmail;

    @Column(name = "device_info", length = 255)
    private String deviceInfo;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "qr_token", length = 255)
    private String qrToken;

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
    public AttendanceSession getAttendanceSession() { return attendanceSession; }
    public void setAttendanceSession(AttendanceSession attendanceSession) { this.attendanceSession = attendanceSession; }
    public LocalDate getAttendanceDate() { return attendanceDate; }
    public void setAttendanceDate(LocalDate attendanceDate) { this.attendanceDate = attendanceDate; }
    public LocalTime getAttendanceTime() { return attendanceTime; }
    public void setAttendanceTime(LocalTime attendanceTime) { this.attendanceTime = attendanceTime; }
    public AttendanceStatus getStatus() { return status; }
    public void setStatus(AttendanceStatus status) { this.status = status; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public String getUserRole() { return userRole; }
    public void setUserRole(String userRole) { this.userRole = userRole; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public LocalDateTime getMarkedAt() { return markedAt; }
    public void setMarkedAt(LocalDateTime markedAt) { this.markedAt = markedAt; }
    public String getRecordedByFacultyEmail() { return recordedByFacultyEmail; }
    public void setRecordedByFacultyEmail(String recordedByFacultyEmail) { this.recordedByFacultyEmail = recordedByFacultyEmail; }
    public String getDeviceInfo() { return deviceInfo; }
    public void setDeviceInfo(String deviceInfo) { this.deviceInfo = deviceInfo; }
    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
    public String getQrToken() { return qrToken; }
    public void setQrToken(String qrToken) { this.qrToken = qrToken; }

    public static AttendanceBuilder builder() {
        return new AttendanceBuilder();
    }

    public static class AttendanceBuilder {
        private Student student;
        private AttendanceSession attendanceSession;
        private LocalDate attendanceDate;
        private LocalTime attendanceTime;
        private AttendanceStatus status;
        private String remarks;
        private String userEmail;
        private String userName;
        private String userRole;
        private LocalDate date;
        private LocalDateTime markedAt;
        private String recordedByFacultyEmail;
        private String deviceInfo;
        private String ipAddress;
        private String qrToken;
        private Boolean active = true;
        private Boolean deleted = false;

        public AttendanceBuilder student(Student student) { this.student = student; return this; }
        public AttendanceBuilder attendanceSession(AttendanceSession attendanceSession) { this.attendanceSession = attendanceSession; return this; }
        public AttendanceBuilder attendanceDate(LocalDate attendanceDate) { this.attendanceDate = attendanceDate; return this; }
        public AttendanceBuilder attendanceTime(LocalTime attendanceTime) { this.attendanceTime = attendanceTime; return this; }
        public AttendanceBuilder status(AttendanceStatus status) { this.status = status; return this; }
        public AttendanceBuilder remarks(String remarks) { this.remarks = remarks; return this; }
        public AttendanceBuilder userEmail(String userEmail) { this.userEmail = userEmail; return this; }
        public AttendanceBuilder userName(String userName) { this.userName = userName; return this; }
        public AttendanceBuilder userRole(String userRole) { this.userRole = userRole; return this; }
        public AttendanceBuilder date(LocalDate date) { this.date = date; return this; }
        public AttendanceBuilder markedAt(LocalDateTime markedAt) { this.markedAt = markedAt; return this; }
        public AttendanceBuilder recordedByFacultyEmail(String recordedByFacultyEmail) { this.recordedByFacultyEmail = recordedByFacultyEmail; return this; }
        public AttendanceBuilder deviceInfo(String deviceInfo) { this.deviceInfo = deviceInfo; return this; }
        public AttendanceBuilder ipAddress(String ipAddress) { this.ipAddress = ipAddress; return this; }
        public AttendanceBuilder qrToken(String qrToken) { this.qrToken = qrToken; return this; }
        public AttendanceBuilder active(Boolean active) { this.active = active; return this; }
        public AttendanceBuilder deleted(Boolean deleted) { this.deleted = deleted; return this; }

        public Attendance build() {
            Attendance a = new Attendance();
            a.setStudent(student);
            a.setAttendanceSession(attendanceSession);
            a.setAttendanceDate(attendanceDate);
            a.setAttendanceTime(attendanceTime);
            a.setStatus(status);
            a.setRemarks(remarks);
            a.setUserEmail(userEmail);
            a.setUserName(userName);
            a.setUserRole(userRole);
            a.setDate(date);
            a.setMarkedAt(markedAt);
            a.setRecordedByFacultyEmail(recordedByFacultyEmail);
            a.setDeviceInfo(deviceInfo);
            a.setIpAddress(ipAddress);
            a.setQrToken(qrToken);
            a.setActive(active != null ? active : true);
            a.setDeleted(deleted != null ? deleted : false);
            return a;
        }
    }
}
