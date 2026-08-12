package com.mentormatrix.dto.response;

import com.mentormatrix.enums.AttendanceSessionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceSessionResponse {
    private Long id;
    private Long batchId;
    private String batchName;
    private String batchCode;
    private Long subjectId;
    private String subjectName;
    private String subjectCode;
    private Long facultyId;
    private String facultyName;
    private LocalDate sessionDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private AttendanceSessionStatus status;
    private String qrToken;
    private LocalDateTime qrExpiresAt;
}
