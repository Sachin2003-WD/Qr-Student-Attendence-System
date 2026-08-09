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
}
