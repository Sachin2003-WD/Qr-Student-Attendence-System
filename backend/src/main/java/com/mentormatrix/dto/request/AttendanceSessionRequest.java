package com.mentormatrix.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceSessionRequest {

    @NotNull(message = "Batch ID is required")
    private Long batchId;

    @NotNull(message = "Subject ID is required")
    private Long subjectId;

    private Long facultyId;

    private LocalDate sessionDate;

    private LocalTime startTime;

    private LocalTime endTime;
}
