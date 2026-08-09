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
public class AttendanceSummaryResponse {
    private long totalDays;
    private long presentCount;
    private long absentCount;
    private long lateCount;
    private long onLeaveCount;
    private long holidayCount;
    private double attendancePercentage;
    private List<AttendanceResponse> records;
}
