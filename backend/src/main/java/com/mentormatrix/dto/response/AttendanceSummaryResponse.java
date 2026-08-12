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

    public long getTotalDays() { return totalDays; }
    public void setTotalDays(long totalDays) { this.totalDays = totalDays; }
    public long getPresentCount() { return presentCount; }
    public void setPresentCount(long presentCount) { this.presentCount = presentCount; }
    public long getAbsentCount() { return absentCount; }
    public void setAbsentCount(long absentCount) { this.absentCount = absentCount; }
    public long getLateCount() { return lateCount; }
    public void setLateCount(long lateCount) { this.lateCount = lateCount; }
    public long getOnLeaveCount() { return onLeaveCount; }
    public void setOnLeaveCount(long onLeaveCount) { this.onLeaveCount = onLeaveCount; }
    public long getHolidayCount() { return holidayCount; }
    public void setHolidayCount(long holidayCount) { this.holidayCount = holidayCount; }
    public double getAttendancePercentage() { return attendancePercentage; }
    public void setAttendancePercentage(double attendancePercentage) { this.attendancePercentage = attendancePercentage; }
    public List<AttendanceResponse> getRecords() { return records; }
    public void setRecords(List<AttendanceResponse> records) { this.records = records; }

    public static AttendanceSummaryResponseBuilder builder() {
        return new AttendanceSummaryResponseBuilder();
    }

    public static class AttendanceSummaryResponseBuilder {
        private long totalDays;
        private long presentCount;
        private long absentCount;
        private long lateCount;
        private long onLeaveCount;
        private long holidayCount;
        private double attendancePercentage;
        private List<AttendanceResponse> records;

        public AttendanceSummaryResponseBuilder totalDays(long totalDays) { this.totalDays = totalDays; return this; }
        public AttendanceSummaryResponseBuilder presentCount(long presentCount) { this.presentCount = presentCount; return this; }
        public AttendanceSummaryResponseBuilder absentCount(long absentCount) { this.absentCount = absentCount; return this; }
        public AttendanceSummaryResponseBuilder lateCount(long lateCount) { this.lateCount = lateCount; return this; }
        public AttendanceSummaryResponseBuilder onLeaveCount(long onLeaveCount) { this.onLeaveCount = onLeaveCount; return this; }
        public AttendanceSummaryResponseBuilder holidayCount(long holidayCount) { this.holidayCount = holidayCount; return this; }
        public AttendanceSummaryResponseBuilder attendancePercentage(double attendancePercentage) { this.attendancePercentage = attendancePercentage; return this; }
        public AttendanceSummaryResponseBuilder records(List<AttendanceResponse> records) { this.records = records; return this; }

        public AttendanceSummaryResponse build() {
            AttendanceSummaryResponse r = new AttendanceSummaryResponse();
            r.setTotalDays(totalDays);
            r.setPresentCount(presentCount);
            r.setAbsentCount(absentCount);
            r.setLateCount(lateCount);
            r.setOnLeaveCount(onLeaveCount);
            r.setHolidayCount(holidayCount);
            r.setAttendancePercentage(attendancePercentage);
            r.setRecords(records);
            return r;
        }
    }
}
