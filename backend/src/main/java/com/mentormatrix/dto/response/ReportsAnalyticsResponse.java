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
public class ReportsAnalyticsResponse {

    private List<YearlySessionData> yearlySessions;
    private List<MonthlySessionData> monthlySessions;
    private List<DeptDistributionData> deptDistribution;
    private List<RatingTrendData> ratingTrend;
    private List<VolumeTrendData> volumeTrend;
    private List<TopMentorData> topMentors;
    private List<ActiveStudentData> activeStudents;

    public static class YearlySessionData {
        private String year;
        private long sessions;
        private long completed;

        public YearlySessionData() {}
        public YearlySessionData(String year, long sessions, long completed) {
            this.year = year;
            this.sessions = sessions;
            this.completed = completed;
        }

        public String getYear() { return year; }
        public void setYear(String year) { this.year = year; }
        public long getSessions() { return sessions; }
        public void setSessions(long sessions) { this.sessions = sessions; }
        public long getCompleted() { return completed; }
        public void setCompleted(long completed) { this.completed = completed; }
    }

    public static class MonthlySessionData {
        private String month;
        private long sessions;
        private long completed;

        public MonthlySessionData() {}
        public MonthlySessionData(String month, long sessions, long completed) {
            this.month = month;
            this.sessions = sessions;
            this.completed = completed;
        }

        public String getMonth() { return month; }
        public void setMonth(String month) { this.month = month; }
        public long getSessions() { return sessions; }
        public void setSessions(long sessions) { this.sessions = sessions; }
        public long getCompleted() { return completed; }
        public void setCompleted(long completed) { this.completed = completed; }
    }

    public static class DeptDistributionData {
        private String name;
        private long value;

        public DeptDistributionData() {}
        public DeptDistributionData(String name, long value) {
            this.name = name;
            this.value = value;
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public long getValue() { return value; }
        public void setValue(long value) { this.value = value; }
    }

    public static class RatingTrendData {
        private String week;
        private double rating;

        public RatingTrendData() {}
        public RatingTrendData(String week, double rating) {
            this.week = week;
            this.rating = rating;
        }

        public String getWeek() { return week; }
        public void setWeek(String week) { this.week = week; }
        public double getRating() { return rating; }
        public void setRating(double rating) { this.rating = rating; }
    }

    public static class VolumeTrendData {
        private String month;
        private long sessions;

        public VolumeTrendData() {}
        public VolumeTrendData(String month, long sessions) {
            this.month = month;
            this.sessions = sessions;
        }

        public String getMonth() { return month; }
        public void setMonth(String month) { this.month = month; }
        public long getSessions() { return sessions; }
        public void setSessions(long sessions) { this.sessions = sessions; }
    }

    public static class TopMentorData {
        private Long id;
        private String name;
        private String department;
        private double rating;
        private long students;

        public TopMentorData() {}
        public TopMentorData(Long id, String name, String department, double rating, long students) {
            this.id = id;
            this.name = name;
            this.department = department;
            this.rating = rating;
            this.students = students;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }
        public double getRating() { return rating; }
        public void setRating(double rating) { this.rating = rating; }
        public long getStudents() { return students; }
        public void setStudents(long students) { this.students = students; }
    }

    public static class ActiveStudentData {
        private Long id;
        private String name;
        private String department;
        private int progress;

        public ActiveStudentData() {}
        public ActiveStudentData(Long id, String name, String department, int progress) {
            this.id = id;
            this.name = name;
            this.department = department;
            this.progress = progress;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }
        public int getProgress() { return progress; }
        public void setProgress(int progress) { this.progress = progress; }
    }
}
