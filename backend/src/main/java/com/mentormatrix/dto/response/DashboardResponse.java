package com.mentormatrix.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private long totalStudents;
    private long totalFaculty;
    private long totalAdmins;
    private long totalDepartments;
    private long todayAttendanceCount;
    private long presentCount;
    private long absentCount;
    private long lateCount;
    private Map<String, Long> departmentStatistics;
}
