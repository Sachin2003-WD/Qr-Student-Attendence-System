package com.mentormatrix.service.impl;

import com.mentormatrix.dto.request.CreateLeaveRequest;
import com.mentormatrix.dto.request.UpdateLeaveStatusRequest;
import com.mentormatrix.dto.response.LeaveResponse;
import com.mentormatrix.entity.Attendance;
import com.mentormatrix.entity.LeaveRequest;
import com.mentormatrix.entity.Student;
import com.mentormatrix.entity.User;
import com.mentormatrix.enums.AttendanceStatus;
import com.mentormatrix.enums.LeaveStatus;
import com.mentormatrix.exception.BadRequestException;
import com.mentormatrix.exception.ResourceNotFoundException;
import com.mentormatrix.repository.AttendanceRepository;
import com.mentormatrix.repository.LeaveRequestRepository;
import com.mentormatrix.repository.StudentRepository;
import com.mentormatrix.repository.UserRepository;
import com.mentormatrix.service.LeaveService;
import com.mentormatrix.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LeaveServiceImpl implements LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final AttendanceRepository attendanceRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public LeaveResponse submitLeaveRequest(String studentEmail, CreateLeaveRequest request) {
        if (request.getFromDate().isAfter(request.getToDate())) {
            throw new BadRequestException("From date cannot be after To date.");
        }

        Student student = studentRepository.findByEmailAndDeletedFalse(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for email: " + studentEmail));

        LeaveRequest leave = LeaveRequest.builder()
                .student(student)
                .fromDate(request.getFromDate())
                .toDate(request.getToDate())
                .reason(request.getReason())
                .documentPath(request.getDocumentPath())
                .status(LeaveStatus.PENDING)
                .active(true)
                .deleted(false)
                .build();

        LeaveRequest saved = leaveRequestRepository.save(leave);
        log.info("Leave request submitted by student: {} ({}) for dates {} to {}",
                student.getName(), studentEmail, request.getFromDate(), request.getToDate());

        notificationService.createNotification(
                studentEmail,
                "STUDENT",
                "Leave Request Submitted",
                "Your leave request from " + request.getFromDate() + " to " + request.getToDate() + " has been submitted for faculty review."
        );

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveResponse> getMyLeaveRequests(String studentEmail) {
        Student student = studentRepository.findByEmailAndDeletedFalse(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found for email: " + studentEmail));

        List<LeaveRequest> list = leaveRequestRepository.findByStudentIdAndDeletedFalse(student.getId());
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveResponse> getAllLeaveRequests(LeaveStatus status) {
        List<LeaveRequest> list;
        if (status != null) {
            list = leaveRequestRepository.findAllByDeletedFalse(org.springframework.data.domain.Pageable.unpaged())
                    .stream()
                    .filter(l -> l.getStatus() == status)
                    .collect(Collectors.toList());
        } else {
            list = leaveRequestRepository.findAllByDeletedFalse(org.springframework.data.domain.Pageable.unpaged()).getContent();
        }
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public LeaveResponse updateLeaveStatus(Long id, UpdateLeaveStatusRequest request, String reviewerEmail) {
        LeaveRequest leave = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with ID: " + id));

        User reviewer = userRepository.findByEmailAndDeletedFalse(reviewerEmail).orElse(null);

        leave.setStatus(request.getStatus());
        leave.setReviewedBy(reviewer);
        leave.setReviewedAt(LocalDateTime.now());

        LeaveRequest updated = leaveRequestRepository.save(leave);

        Student student = leave.getStudent();
        String studentEmail = student != null && student.getUser() != null ? student.getUser().getEmail() : (student != null ? student.getEmail() : null);

        // If approved, automatically record ON_LEAVE in attendance for those days
        if (request.getStatus() == LeaveStatus.APPROVED && student != null && studentEmail != null) {
            LocalDate curr = leave.getFromDate();
            while (!curr.isAfter(leave.getToDate())) {
                if (!attendanceRepository.existsByUserEmailAndDateAndDeletedFalse(studentEmail, curr)) {
                    Attendance att = Attendance.builder()
                            .userEmail(studentEmail)
                            .userName(student.getName())
                            .userRole("STUDENT")
                            .date(curr)
                            .attendanceDate(curr)
                            .attendanceTime(LocalTime.of(9, 0))
                            .markedAt(LocalDateTime.now())
                            .status(AttendanceStatus.ON_LEAVE)
                            .deviceInfo("Approved Leave")
                            .recordedByFacultyEmail(reviewerEmail)
                            .active(true)
                            .deleted(false)
                            .build();
                    attendanceRepository.save(att);
                }
                curr = curr.plusDays(1);
            }
        }

        if (studentEmail != null) {
            String title = request.getStatus() == LeaveStatus.APPROVED ? "Leave Request Approved" : "Leave Request Rejected";
            String msg = "Your leave request for " + leave.getFromDate() + " to " + leave.getToDate() + " was " + request.getStatus().name().toLowerCase() + ".";
            if (request.getRemarks() != null && !request.getRemarks().isBlank()) {
                msg += " Note: " + request.getRemarks();
            }
            notificationService.createNotification(studentEmail, "STUDENT", title, msg);
        }

        return mapToResponse(updated);
    }

    private LeaveResponse mapToResponse(LeaveRequest leave) {
        Student student = leave.getStudent();
        String studentName = student != null ? student.getName() : "Student";
        String studentEmail = student != null && student.getUser() != null ? student.getUser().getEmail() : (student != null ? student.getEmail() : "");
        String studentUsn = student != null ? student.getUsn() : "";
        String dept = student != null && student.getDepartment() != null ? student.getDepartment().getName() : "";
        String reviewer = leave.getReviewedBy() != null ? leave.getReviewedBy().getName() : null;

        return LeaveResponse.builder()
                .id(leave.getId())
                .studentId(student != null ? student.getId() : null)
                .studentName(studentName)
                .studentEmail(studentEmail)
                .studentUsn(studentUsn)
                .department(dept)
                .fromDate(leave.getFromDate())
                .toDate(leave.getToDate())
                .reason(leave.getReason())
                .documentPath(leave.getDocumentPath())
                .status(leave.getStatus())
                .reviewedBy(reviewer)
                .reviewedAt(leave.getReviewedAt())
                .createdAt(leave.getCreatedAt() != null ? leave.getCreatedAt() : LocalDateTime.now())
                .build();
    }
}
