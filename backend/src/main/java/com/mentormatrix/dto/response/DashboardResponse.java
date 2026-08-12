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

    public long getTotalStudents() { return totalStudents; }
    public void setTotalStudents(long totalStudents) { this.totalStudents = totalStudents; }
    public long getTotalFaculty() { return totalFaculty; }
    public void setTotalFaculty(long totalFaculty) { this.totalFaculty = totalFaculty; }
    public long getTotalAdmins() { return totalAdmins; }
    public void setTotalAdmins(long totalAdmins) { this.totalAdmins = totalAdmins; }
    public long getTotalDepartments() { return totalDepartments; }
    public void setTotalDepartments(long totalDepartments) { this.totalDepartments = totalDepartments; }
    public long getTodayAttendanceCount() { return todayAttendanceCount; }
    public void setTodayAttendanceCount(long todayAttendanceCount) { this.todayAttendanceCount = todayAttendanceCount; }
    public long getPresentCount() { return presentCount; }
    public void setPresentCount(long presentCount) { this.presentCount = presentCount; }
    public long getAbsentCount() { return absentCount; }
    public void setAbsentCount(long absentCount) { this.absentCount = absentCount; }
    public long getLateCount() { return lateCount; }
    public void setLateCount(long lateCount) { this.lateCount = lateCount; }
    public Map<String, Long> getDepartmentStatistics() { return departmentStatistics; }
    public void setDepartmentStatistics(Map<String, Long> departmentStatistics) { this.departmentStatistics = departmentStatistics; }

    public static DashboardResponseBuilder builder() {
        return new DashboardResponseBuilder();
    }

    public static class DashboardResponseBuilder {
        private long totalStudents;
        private long totalFaculty;
        private long totalAdmins;
        private long totalDepartments;
        private long todayAttendanceCount;
        private long presentCount;
        private long absentCount;
        private long lateCount;
        private Map<String, Long> departmentStatistics;

        public DashboardResponseBuilder totalStudents(long totalStudents) { this.totalStudents = totalStudents; return this; }
        public DashboardResponseBuilder totalFaculty(long totalFaculty) { this.totalFaculty = totalFaculty; return this; }
        public DashboardResponseBuilder totalAdmins(long totalAdmins) { this.totalAdmins = totalAdmins; return this; }
        public DashboardResponseBuilder totalDepartments(long totalDepartments) { this.totalDepartments = totalDepartments; return this; }
        public DashboardResponseBuilder todayAttendanceCount(long todayAttendanceCount) { this.todayAttendanceCount = todayAttendanceCount; return this; }
        public DashboardResponseBuilder presentCount(long presentCount) { this.presentCount = presentCount; return this; }
        public DashboardResponseBuilder absentCount(long absentCount) { this.absentCount = absentCount; return this; }
        public DashboardResponseBuilder lateCount(long lateCount) { this.lateCount = lateCount; return this; }
        public DashboardResponseBuilder departmentStatistics(Map<String, Long> departmentStatistics) { this.departmentStatistics = departmentStatistics; return this; }

        public DashboardResponse build() {
            DashboardResponse d = new DashboardResponse();
            d.setTotalStudents(totalStudents);
            d.setTotalFaculty(totalFaculty);
            d.setTotalAdmins(totalAdmins);
            d.setTotalDepartments(totalDepartments);
            d.setTodayAttendanceCount(todayAttendanceCount);
            d.setPresentCount(presentCount);
            d.setAbsentCount(absentCount);
            d.setLateCount(lateCount);
            d.setDepartmentStatistics(departmentStatistics);
            return d;
        }
    }
}
