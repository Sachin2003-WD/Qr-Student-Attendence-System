package com.mentormatrix.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;

@Entity
@Table(name = "batches")
@SuperBuilder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Batch extends BaseEntity {

    @NotBlank(message = "Batch name is required")
    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "batch_code", length = 50)
    private String batchCode;

    @NotNull(message = "Course is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @NotNull(message = "Start year is required")
    @Column(name = "start_year", nullable = false)
    private Integer startYear;

    @NotNull(message = "End year is required")
    @Column(name = "end_year", nullable = false)
    private Integer endYear;

    @Column(length = 10)
    private String section;

    @Column(nullable = false)
    private Integer semester;

    @Column(length = 100)
    private String branch;

    @Column(name = "class_timing", length = 30)
    private String classTiming;

    @Column(name = "subject_name", length = 100)
    private String subjectName;

    @Column(name = "trainer_name", length = 100)
    private String trainerName;

    @Column(name = "start_date")
    private LocalDate startDate;
}
