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

    public Long getBatchId() { return batchId; }
    public void setBatchId(Long batchId) { this.batchId = batchId; }
    public String getBatchCode() { return batchCode; }
    public void setBatchCode(String batchCode) { this.batchCode = batchCode; }
    public String getBatchName() { return batchName; }
    public void setBatchName(String batchName) { this.batchName = batchName; }
    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }
    public String getBranchName() { return branchName; }
    public void setBranchName(String branchName) { this.branchName = branchName; }
    public String getTrainerName() { return trainerName; }
    public void setTrainerName(String trainerName) { this.trainerName = trainerName; }
    public String getClassTiming() { return classTiming; }
    public void setClassTiming(String classTiming) { this.classTiming = classTiming; }
    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }
    public long getTotalClasses() { return totalClasses; }
    public void setTotalClasses(long totalClasses) { this.totalClasses = totalClasses; }
    public long getClassesAttended() { return classesAttended; }
    public void setClassesAttended(long classesAttended) { this.classesAttended = classesAttended; }
    public long getClassesAbsent() { return classesAbsent; }
    public void setClassesAbsent(long classesAbsent) { this.classesAbsent = classesAbsent; }
    public double getAttendancePercentage() { return attendancePercentage; }
    public void setAttendancePercentage(double attendancePercentage) { this.attendancePercentage = attendancePercentage; }
    public List<AttendanceResponse> getRecords() { return records; }
    public void setRecords(List<AttendanceResponse> records) { this.records = records; }

    public static BatchAttendanceResponseBuilder builder() {
        return new BatchAttendanceResponseBuilder();
    }

    public static class BatchAttendanceResponseBuilder {
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

        public BatchAttendanceResponseBuilder batchId(Long batchId) { this.batchId = batchId; return this; }
        public BatchAttendanceResponseBuilder batchCode(String batchCode) { this.batchCode = batchCode; return this; }
        public BatchAttendanceResponseBuilder batchName(String batchName) { this.batchName = batchName; return this; }
        public BatchAttendanceResponseBuilder subjectName(String subjectName) { this.subjectName = subjectName; return this; }
        public BatchAttendanceResponseBuilder branchName(String branchName) { this.branchName = branchName; return this; }
        public BatchAttendanceResponseBuilder trainerName(String trainerName) { this.trainerName = trainerName; return this; }
        public BatchAttendanceResponseBuilder classTiming(String classTiming) { this.classTiming = classTiming; return this; }
        public BatchAttendanceResponseBuilder startDate(String startDate) { this.startDate = startDate; return this; }
        public BatchAttendanceResponseBuilder totalClasses(long totalClasses) { this.totalClasses = totalClasses; return this; }
        public BatchAttendanceResponseBuilder classesAttended(long classesAttended) { this.classesAttended = classesAttended; return this; }
        public BatchAttendanceResponseBuilder classesAbsent(long classesAbsent) { this.classesAbsent = classesAbsent; return this; }
        public BatchAttendanceResponseBuilder attendancePercentage(double attendancePercentage) { this.attendancePercentage = attendancePercentage; return this; }
        public BatchAttendanceResponseBuilder records(List<AttendanceResponse> records) { this.records = records; return this; }

        public BatchAttendanceResponse build() {
            BatchAttendanceResponse b = new BatchAttendanceResponse();
            b.setBatchId(batchId);
            b.setBatchCode(batchCode);
            b.setBatchName(batchName);
            b.setSubjectName(subjectName);
            b.setBranchName(branchName);
            b.setTrainerName(trainerName);
            b.setClassTiming(classTiming);
            b.setStartDate(startDate);
            b.setTotalClasses(totalClasses);
            b.setClassesAttended(classesAttended);
            b.setClassesAbsent(classesAbsent);
            b.setAttendancePercentage(attendancePercentage);
            b.setRecords(records);
            return b;
        }
    }
}
