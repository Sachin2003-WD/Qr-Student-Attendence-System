package com.mentormatrix.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchRequest {

    @NotBlank(message = "Batch name is required")
    private String name;

    @NotBlank(message = "Batch code is required")
    private String batchCode;

    private String subjectName;
    private String branch;
    private String classTiming;
    private String trainerName;
    private LocalDate startDate;
    private Long courseId;
    private Integer semester;
    private Integer startYear;
    private Integer endYear;
}
