package com.mentormatrix.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchAttendanceResponse {
    private Long batchId;
    private String batchCode;
    private String batchName;
    private String subjectName;
    private String branchName;
    private String trainerName;
    private String classTiming;
    private String startDate;
    private long totalClasses;
    private long classesAttended;
    private long classesAbsent;
    private double attendancePercentage;
    private List<AttendanceResponse> records;
}
