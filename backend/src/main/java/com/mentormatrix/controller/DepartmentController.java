package com.mentormatrix.controller;

import com.mentormatrix.dto.request.DepartmentRequest;
import com.mentormatrix.dto.response.AttendanceResponse;
import com.mentormatrix.dto.response.DepartmentAttendanceResponse;
import com.mentormatrix.entity.Attendance;
import com.mentormatrix.entity.Batch;
import com.mentormatrix.entity.Department;
import com.mentormatrix.entity.Student;
import com.mentormatrix.enums.AttendanceStatus;
import com.mentormatrix.exception.ResourceNotFoundException;
import com.mentormatrix.repository.AttendanceRepository;
import com.mentormatrix.repository.BatchRepository;
import com.mentormatrix.repository.DepartmentRepository;
import com.mentormatrix.repository.StudentRepository;
import com.mentormatrix.response.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/departments")
@Tag(name = "Department Controller", description = "Endpoints for department management and department-wise attendance")
@RequiredArgsConstructor
public class DepartmentController {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(DepartmentController.class);

    private final DepartmentRepository departmentRepository;
    private final StudentRepository studentRepository;
    private final AttendanceRepository attendanceRepository;
    private final BatchRepository batchRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'FACULTY', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<Department>>> getAllDepartments() {
        log.info("Fetching all active departments");
        List<Department> departments = departmentRepository.findByDeletedFalse();
        return ResponseEntity.ok(ApiResponse.success("Fetched all active departments", departments));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'FACULTY', 'ADMIN')")
    public ResponseEntity<ApiResponse<Department>> getDepartmentById(@PathVariable Long id) {
        log.info("Fetching department by ID: {}", id);
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + id));
        return ResponseEntity.ok(ApiResponse.success("Fetched department details", department));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Department>> createDepartment(@Valid @RequestBody DepartmentRequest request) {
        log.info("Creating new department: {}", request.getName());
        Department department = Department.builder()
                .name(request.getName().trim())
                .code(request.getCode().trim().toUpperCase())
                .description(request.getDescription())
                .active(true)
                .deleted(false)
                .build();
        Department saved = departmentRepository.save(department);
        return ResponseEntity.ok(ApiResponse.success("Department created successfully", saved));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteDepartment(@PathVariable Long id) {
        log.info("Deleting department with ID: {}", id);
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + id));
        department.setDeleted(true);
        department.setActive(false);
        departmentRepository.save(department);
        return ResponseEntity.ok(ApiResponse.success("Department deleted successfully", null));
    }

    @GetMapping("/attendance")
    @PreAuthorize("hasAnyRole('STUDENT', 'FACULTY', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<DepartmentAttendanceResponse>>> getDepartmentWiseAttendance() {
        log.info("Generating department-wise attendance statistics");
        List<Department> departments = departmentRepository.findByDeletedFalse();
        List<Student> allStudents = studentRepository.findAllByDeletedFalse();
        List<Attendance> allAttendance = attendanceRepository.findAll();
        List<Batch> allBatches = batchRepository.findByDeletedFalse();

        List<DepartmentAttendanceResponse> responseList = new ArrayList<>();

        for (Department dept : departments) {
            List<Student> deptStudents = allStudents.stream()
                    .filter(s -> (s.getDepartment() != null && s.getDepartment().getId().equals(dept.getId())) ||
                            (s.getDepartment() != null && s.getDepartment().getName().equalsIgnoreCase(dept.getName())))
                    .collect(Collectors.toList());

            List<Batch> deptBatches = allBatches.stream()
                    .filter(b -> (b.getDepartment() != null && b.getDepartment().getId().equals(dept.getId())) ||
                            (b.getDepartmentName() != null && b.getDepartmentName().equalsIgnoreCase(dept.getName())) ||
                            (b.getDepartmentCode() != null && b.getDepartmentCode().equalsIgnoreCase(dept.getCode())))
                    .collect(Collectors.toList());

            Set<String> deptStudentEmails = deptStudents.stream()
                    .map(Student::getEmail)
                    .filter(Objects::nonNull)
                    .map(String::toLowerCase)
                    .collect(Collectors.toSet());

            Set<Long> deptStudentIds = deptStudents.stream()
                    .map(Student::getId)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());

            List<Attendance> deptLogs = allAttendance.stream()
                    .filter(a -> {
                        if (Boolean.TRUE.equals(a.getDeleted())) return false;
                        if (a.getStudent() != null && deptStudentIds.contains(a.getStudent().getId())) return true;
                        if (a.getUserEmail() != null && deptStudentEmails.contains(a.getUserEmail().toLowerCase())) return true;
                        return false;
                    })
                    .collect(Collectors.toList());

            long totalStudents = deptStudents.size();
            long totalLogs = deptLogs.size();
            long presentCount = deptLogs.stream()
                    .filter(a -> a.getStatus() == AttendanceStatus.PRESENT || a.getStatus() == AttendanceStatus.LATE)
                    .count();
            long absentCount = deptLogs.stream()
                    .filter(a -> a.getStatus() == AttendanceStatus.ABSENT)
                    .count();

            double percentage = totalLogs > 0 ? ((double) presentCount / totalLogs) * 100.0 : (totalStudents > 0 ? 0.0 : 0.0);
            percentage = Math.round(percentage * 10.0) / 10.0;

            List<AttendanceResponse> recentRecords = deptLogs.stream()
                    .sorted((a, b) -> {
                        if (a.getMarkedAt() != null && b.getMarkedAt() != null) {
                            return b.getMarkedAt().compareTo(a.getMarkedAt());
                        }
                        return 0;
                    })
                    .limit(10)
                    .map(this::mapAttendanceToResponse)
                    .collect(Collectors.toList());

            responseList.add(DepartmentAttendanceResponse.builder()
                    .departmentId(dept.getId())
                    .departmentName(dept.getName())
                    .departmentCode(dept.getCode())
                    .description(dept.getDescription())
                    .totalStudents(totalStudents)
                    .totalBatches(deptBatches.size())
                    .batches(deptBatches)
                    .totalAttendanceLogs(totalLogs)
                    .presentCount(presentCount)
                    .absentCount(absentCount)
                    .attendancePercentage(percentage)
                    .recentRecords(recentRecords)
                    .build());
        }

        return ResponseEntity.ok(ApiResponse.success("Department-wise attendance calculated successfully", responseList));
    }

    private AttendanceResponse mapAttendanceToResponse(Attendance attendance) {
        String subjCode = "GEN101";
        String subjName = "General Session";
        String sessTime = "09:00 AM";

        if (attendance.getAttendanceSession() != null) {
            if (attendance.getAttendanceSession().getSubject() != null) {
                subjCode = attendance.getAttendanceSession().getSubject().getCode();
                subjName = attendance.getAttendanceSession().getSubject().getName();
            }
            if (attendance.getAttendanceSession().getStartTime() != null) {
                sessTime = attendance.getAttendanceSession().getStartTime().toString();
            }
        }

        return AttendanceResponse.builder()
                .id(attendance.getId())
                .userEmail(attendance.getUserEmail())
                .userName(attendance.getUserName())
                .userRole(attendance.getUserRole())
                .date(attendance.getDate() != null ? attendance.getDate() : attendance.getAttendanceDate())
                .markedAt(attendance.getMarkedAt())
                .status(attendance.getStatus())
                .subjectCode(subjCode)
                .subjectName(subjName)
                .sessionTime(sessTime)
                .recordedByFacultyEmail(attendance.getRecordedByFacultyEmail())
                .deviceInfo(attendance.getDeviceInfo())
                .ipAddress(attendance.getIpAddress())
                .build();
    }
}
