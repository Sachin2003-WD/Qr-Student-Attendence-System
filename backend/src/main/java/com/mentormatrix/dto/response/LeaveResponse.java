package com.mentormatrix.dto.response;

import com.mentormatrix.enums.LeaveStatus;
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
public class LeaveResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private String studentUsn;
    private String department;
    private LocalDate fromDate;
    private LocalDate toDate;
    private String leaveType;
    private String reason;
    private String documentPath;
    private LeaveStatus status;
    private String reviewedBy;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
}
