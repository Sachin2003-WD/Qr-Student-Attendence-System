package com.mentormatrix.controller;

import com.mentormatrix.dto.request.BatchRequest;
import com.mentormatrix.entity.Batch;
import com.mentormatrix.entity.Course;
import com.mentormatrix.exception.ResourceNotFoundException;
import com.mentormatrix.repository.BatchRepository;
import com.mentormatrix.repository.CourseRepository;
import com.mentormatrix.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/batches")
@RequiredArgsConstructor
public class BatchController {

    private final BatchRepository batchRepository;
    private final CourseRepository courseRepository;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Batch>> createBatch(@Valid @RequestBody BatchRequest request) {
        Course course = null;
        if (request.getCourseId() != null) {
            course = courseRepository.findById(request.getCourseId()).orElse(null);
        }
        if (course == null) {
            course = courseRepository.findAll().stream().findFirst()
                    .orElseGet(() -> courseRepository.save(Course.builder()
                            .name("Computer Science & Engineering")
                            .code("CSE")
                            .department(null)
                            .active(true)
                            .deleted(false)
                            .build()));
        }

        Batch batch = Batch.builder()
                .name(request.getName())
                .batchCode(request.getBatchCode())
                .course(course)
                .subjectName(request.getSubjectName() != null ? request.getSubjectName() : "")
                .branch(request.getBranch() != null ? request.getBranch() : "")
                .classTiming(request.getClassTiming() != null ? request.getClassTiming() : "04:45 PM")
                .trainerName(request.getTrainerName() != null ? request.getTrainerName() : "")
                .startDate(request.getStartDate() != null ? request.getStartDate() : LocalDate.of(2026, 6, 24))
                .semester(request.getSemester() != null ? request.getSemester() : 5)
                .startYear(request.getStartYear() != null ? request.getStartYear() : 2024)
                .endYear(request.getEndYear() != null ? request.getEndYear() : 2026)
                .active(true)
                .deleted(false)
                .build();

        Batch saved = batchRepository.save(batch);
        return ResponseEntity.ok(ApiResponse.success("Batch created successfully", saved));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'FACULTY', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<Batch>>> getAllBatches() {
        List<Batch> list = batchRepository.findByDeletedFalse();
        return ResponseEntity.ok(ApiResponse.success("Fetched all active batches", list));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'FACULTY', 'ADMIN')")
    public ResponseEntity<ApiResponse<Batch>> getBatchById(@PathVariable Long id) {
        Batch batch = batchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found with ID: " + id));
        return ResponseEntity.ok(ApiResponse.success("Fetched batch details", batch));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteBatch(@PathVariable Long id) {
        Batch batch = batchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found with ID: " + id));
        batch.setDeleted(true);
        batch.setActive(false);
        batchRepository.save(batch);
        return ResponseEntity.ok(ApiResponse.success("Batch deleted successfully", null));
    }
}
