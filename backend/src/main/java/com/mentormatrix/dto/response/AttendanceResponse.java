package com.mentormatrix.dto.response;

import com.mentormatrix.enums.AttendanceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceResponse {
    private Long id;
    private String userEmail;
    private String userName;
    private String userRole;
    private LocalDate date;
    private LocalDateTime markedAt;
    private AttendanceStatus status;
    private String subjectCode;
    private String subjectName;
    private String sessionTime;
    private String recordedByFacultyEmail;
    private String deviceInfo;
    private String ipAddress;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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
    public AttendanceStatus getStatus() { return status; }
    public void setStatus(AttendanceStatus status) { this.status = status; }
    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }
    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }
    public String getSessionTime() { return sessionTime; }
    public void setSessionTime(String sessionTime) { this.sessionTime = sessionTime; }
    public String getRecordedByFacultyEmail() { return recordedByFacultyEmail; }
    public void setRecordedByFacultyEmail(String recordedByFacultyEmail) { this.recordedByFacultyEmail = recordedByFacultyEmail; }
    public String getDeviceInfo() { return deviceInfo; }
    public void setDeviceInfo(String deviceInfo) { this.deviceInfo = deviceInfo; }
    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public static AttendanceResponseBuilder builder() {
        return new AttendanceResponseBuilder();
    }

    public static class AttendanceResponseBuilder {
        private Long id;
        private String userEmail;
        private String userName;
        private String userRole;
        private LocalDate date;
        private LocalDateTime markedAt;
        private AttendanceStatus status;
        private String subjectCode;
        private String subjectName;
        private String sessionTime;
        private String recordedByFacultyEmail;
        private String deviceInfo;
        private String ipAddress;

        public AttendanceResponseBuilder id(Long id) { this.id = id; return this; }
        public AttendanceResponseBuilder userEmail(String userEmail) { this.userEmail = userEmail; return this; }
        public AttendanceResponseBuilder userName(String userName) { this.userName = userName; return this; }
        public AttendanceResponseBuilder userRole(String userRole) { this.userRole = userRole; return this; }
        public AttendanceResponseBuilder date(LocalDate date) { this.date = date; return this; }
        public AttendanceResponseBuilder markedAt(LocalDateTime markedAt) { this.markedAt = markedAt; return this; }
        public AttendanceResponseBuilder status(AttendanceStatus status) { this.status = status; return this; }
        public AttendanceResponseBuilder subjectCode(String subjectCode) { this.subjectCode = subjectCode; return this; }
        public AttendanceResponseBuilder subjectName(String subjectName) { this.subjectName = subjectName; return this; }
        public AttendanceResponseBuilder sessionTime(String sessionTime) { this.sessionTime = sessionTime; return this; }
        public AttendanceResponseBuilder recordedByFacultyEmail(String recordedByFacultyEmail) { this.recordedByFacultyEmail = recordedByFacultyEmail; return this; }
        public AttendanceResponseBuilder deviceInfo(String deviceInfo) { this.deviceInfo = deviceInfo; return this; }
        public AttendanceResponseBuilder ipAddress(String ipAddress) { this.ipAddress = ipAddress; return this; }

        public AttendanceResponse build() {
            AttendanceResponse r = new AttendanceResponse();
            r.setId(id);
            r.setUserEmail(userEmail);
            r.setUserName(userName);
            r.setUserRole(userRole);
            r.setDate(date);
            r.setMarkedAt(markedAt);
            r.setStatus(status);
            r.setSubjectCode(subjectCode);
            r.setSubjectName(subjectName);
            r.setSessionTime(sessionTime);
            r.setRecordedByFacultyEmail(recordedByFacultyEmail);
            r.setDeviceInfo(deviceInfo);
            r.setIpAddress(ipAddress);
            return r;
        }
    }
}
