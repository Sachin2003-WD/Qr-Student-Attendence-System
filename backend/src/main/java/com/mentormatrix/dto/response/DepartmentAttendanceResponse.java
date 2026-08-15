package com.mentormatrix.dto.response;

import com.mentormatrix.entity.Batch;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentAttendanceResponse {

    private Long departmentId;
    private String departmentName;
    private String departmentCode;
    private String description;
    private long totalStudents;
    private long totalBatches;
    private long totalAttendanceLogs;
    private long presentCount;
    private long absentCount;
    private double attendancePercentage;
    private List<Batch> batches;
    private List<AttendanceResponse> recentRecords;

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }
    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }
    public String getDepartmentCode() { return departmentCode; }
    public void setDepartmentCode(String departmentCode) { this.departmentCode = departmentCode; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public long getTotalStudents() { return totalStudents; }
    public void setTotalStudents(long totalStudents) { this.totalStudents = totalStudents; }
    public long getTotalBatches() { return totalBatches; }
    public void setTotalBatches(long totalBatches) { this.totalBatches = totalBatches; }
    public long getTotalAttendanceLogs() { return totalAttendanceLogs; }
    public void setTotalAttendanceLogs(long totalAttendanceLogs) { this.totalAttendanceLogs = totalAttendanceLogs; }
    public long getPresentCount() { return presentCount; }
    public void setPresentCount(long presentCount) { this.presentCount = presentCount; }
    public long getAbsentCount() { return absentCount; }
    public void setAbsentCount(long absentCount) { this.absentCount = absentCount; }
    public double getAttendancePercentage() { return attendancePercentage; }
    public void setAttendancePercentage(double attendancePercentage) { this.attendancePercentage = attendancePercentage; }
    public List<Batch> getBatches() { return batches; }
    public void setBatches(List<Batch> batches) { this.batches = batches; }
    public List<AttendanceResponse> getRecentRecords() { return recentRecords; }
    public void setRecentRecords(List<AttendanceResponse> recentRecords) { this.recentRecords = recentRecords; }
}
