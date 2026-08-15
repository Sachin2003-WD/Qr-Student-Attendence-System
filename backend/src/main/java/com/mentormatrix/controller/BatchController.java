package com.mentormatrix.controller;

import com.mentormatrix.dto.request.BatchRequest;
import com.mentormatrix.entity.Batch;
import com.mentormatrix.entity.Course;
import com.mentormatrix.entity.Department;
import com.mentormatrix.exception.ResourceNotFoundException;
import com.mentormatrix.repository.BatchRepository;
import com.mentormatrix.repository.CourseRepository;
import com.mentormatrix.repository.DepartmentRepository;
import com.mentormatrix.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/batches")
@RequiredArgsConstructor
public class BatchController {

    private final BatchRepository batchRepository;
    private final CourseRepository courseRepository;
    private final DepartmentRepository departmentRepository;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Batch>> createBatch(@Valid @RequestBody BatchRequest request) {
        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId()).orElse(null);
        }
        if (department == null && request.getDepartmentName() != null && !request.getDepartmentName().isBlank()) {
            department = departmentRepository.findByNameAndDeletedFalse(request.getDepartmentName())
                    .orElseGet(() -> departmentRepository.findByCodeAndDeletedFalse(request.getDepartmentCode() != null ? request.getDepartmentCode() : request.getDepartmentName())
                            .orElse(null));
        }

        String deptName = department != null ? department.getName() : (request.getDepartmentName() != null ? request.getDepartmentName() : "General");
        String deptCode = department != null ? department.getCode() : (request.getDepartmentCode() != null ? request.getDepartmentCode() : "GEN");

        final Department finalDept = department;
        final String finalDeptName = deptName;
        final String finalDeptCode = deptCode;

        Course course = null;
        if (request.getCourseId() != null) {
            course = courseRepository.findById(request.getCourseId()).orElse(null);
        }
        if (course == null) {
            course = courseRepository.findAll().stream().findFirst()
                    .orElseGet(() -> courseRepository.save(Course.builder()
                            .name(finalDeptName + " Course")
                            .code(finalDeptCode)
                            .department(finalDept)
                            .active(true)
                            .deleted(false)
                            .build()));
        }

        Batch batch = Batch.builder()
                .name(request.getName().trim())
                .batchCode(request.getBatchCode().trim().toUpperCase())
                .department(department)
                .departmentName(deptName)
                .departmentCode(deptCode)
                .course(course)
                .subjectName(request.getSubjectName() != null ? request.getSubjectName().trim() : "")
                .branch(request.getBranch() != null ? request.getBranch().trim() : "")
                .classTiming(request.getClassTiming() != null ? request.getClassTiming().trim() : "")
                .trainerName(request.getTrainerName() != null ? request.getTrainerName().trim() : "")
                .startDate(request.getStartDate() != null ? request.getStartDate() : LocalDate.now())
                .semester(request.getSemester() != null ? request.getSemester() : 1)
                .startYear(request.getStartYear() != null ? request.getStartYear() : LocalDate.now().getYear())
                .endYear(request.getEndYear() != null ? request.getEndYear() : LocalDate.now().getYear() + 2)
                .active(true)
                .deleted(false)
                .build();

        Batch saved = batchRepository.save(batch);
        return ResponseEntity.ok(ApiResponse.success("Batch created successfully under " + deptName, saved));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'FACULTY', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<Batch>>> getAllBatches(@RequestParam(required = false) Long departmentId,
                                                                   @RequestParam(required = false) String department) {
        List<Batch> list;
        if (departmentId != null) {
            list = batchRepository.findByDepartmentIdAndDeletedFalse(departmentId);
        } else if (department != null && !department.isBlank()) {
            list = batchRepository.findByDepartmentNameIgnoreCaseAndDeletedFalse(department.trim());
        } else {
            list = batchRepository.findByDeletedFalse();
        }
        return ResponseEntity.ok(ApiResponse.success("Fetched batches", list));
    }

    @GetMapping("/department/{departmentId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'FACULTY', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<Batch>>> getBatchesByDepartment(@PathVariable Long departmentId) {
        List<Batch> list = batchRepository.findByDepartmentIdAndDeletedFalse(departmentId);
        return ResponseEntity.ok(ApiResponse.success("Fetched department batches", list));
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
