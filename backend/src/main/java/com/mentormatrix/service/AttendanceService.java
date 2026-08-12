package com.mentormatrix.service;

import com.mentormatrix.dto.request.AttendanceSessionRequest;
import com.mentormatrix.dto.request.MarkAttendanceRequest;
import com.mentormatrix.dto.request.QrScanRequest;
import com.mentormatrix.dto.response.AttendanceResponse;
import com.mentormatrix.dto.response.AttendanceSummaryResponse;
import com.mentormatrix.dto.response.BatchAttendanceResponse;
import com.mentormatrix.dto.response.QRCodeResponse;
import com.mentormatrix.entity.AttendanceSession;
import com.mentormatrix.enums.AttendanceStatus;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceService {

    QRCodeResponse getOrCreateDailyQRCode(String creatorEmail);

    QRCodeResponse generateDynamicStudentQRCode(String studentEmail);

    AttendanceResponse markAttendance(String userEmail, String userRole, String userName, MarkAttendanceRequest request, String ipAddress);

    boolean hasUserMarkedToday(String userEmail);

    AttendanceSummaryResponse getMyAttendanceSummary(String userEmail, LocalDate startDate, LocalDate endDate);

    List<AttendanceResponse> getAttendanceByDate(LocalDate date);

    List<AttendanceResponse> getAttendanceReport(LocalDate startDate, LocalDate endDate);

    AttendanceResponse recordManualAttendance(String studentEmail, LocalDate date, AttendanceStatus status, String facultyEmail);

    // Real Batch-Wise Attendance System APIs
    com.mentormatrix.dto.response.AttendanceSessionResponse createAttendanceSession(AttendanceSessionRequest request, String creatorEmail);

    com.mentormatrix.dto.response.AttendanceSessionResponse startAttendanceSession(Long sessionId);

    com.mentormatrix.dto.response.AttendanceSessionResponse closeAttendanceSession(Long sessionId);

    AttendanceResponse processQrScan(QrScanRequest request, String adminOrFacultyEmail);

    BatchAttendanceResponse getBatchAttendance(Long batchId);

    BatchAttendanceResponse getStudentBatchAttendance(Long studentId, Long batchId);

    List<AttendanceResponse> getStudentAttendance(Long studentId);

    AttendanceSummaryResponse getSessionAttendanceStats(Long sessionId);

    List<AttendanceResponse> searchAttendanceHistory(Long batchId, Long subjectId, LocalDate startDate, LocalDate endDate, AttendanceStatus status);
}
