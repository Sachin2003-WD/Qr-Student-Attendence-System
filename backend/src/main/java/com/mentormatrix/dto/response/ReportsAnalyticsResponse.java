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

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class YearlySessionData {
        private String year;
        private long sessions;
        private long completed;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlySessionData {
        private String month;
        private long sessions;
        private long completed;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeptDistributionData {
        private String name;
        private long value;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RatingTrendData {
        private String week;
        private double rating;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VolumeTrendData {
        private String month;
        private long sessions;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopMentorData {
        private Long id;
        private String name;
        private String department;
        private double rating;
        private long students;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActiveStudentData {
        private Long id;
        private String name;
        private String department;
        private int progress;
    }
}
