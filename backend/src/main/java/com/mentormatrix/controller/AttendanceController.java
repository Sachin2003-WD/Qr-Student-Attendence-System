package com.mentormatrix.controller;

import com.mentormatrix.dto.request.AttendanceSessionRequest;
import com.mentormatrix.dto.request.MarkAttendanceRequest;
import com.mentormatrix.dto.request.QrScanRequest;
import com.mentormatrix.dto.response.AttendanceResponse;
import com.mentormatrix.dto.response.AttendanceSummaryResponse;
import com.mentormatrix.dto.response.BatchAttendanceResponse;
import com.mentormatrix.dto.response.QRCodeResponse;
import com.mentormatrix.entity.AttendanceSession;
import com.mentormatrix.enums.AttendanceStatus;
import com.mentormatrix.response.ApiResponse;
import com.mentormatrix.security.CustomUserDetails;
import com.mentormatrix.service.AttendanceService;
import com.mentormatrix.service.ReportExportService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final ReportExportService reportExportService;

    @GetMapping("/qr/daily")
    @PreAuthorize("hasAnyRole('FACULTY', 'MENTOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<QRCodeResponse>> getDailyQRCode(@AuthenticationPrincipal CustomUserDetails userDetails) {
        QRCodeResponse response = attendanceService.getOrCreateDailyQRCode(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Daily QR Code generated successfully", response));
    }

    @GetMapping("/qr/dynamic")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<QRCodeResponse>> getDynamicStudentQRCode(@AuthenticationPrincipal CustomUserDetails userDetails) {
        QRCodeResponse response = attendanceService.generateDynamicStudentQRCode(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Dynamic Student QR Code generated successfully", response));
    }

    @PostMapping("/mark")
    @PreAuthorize("hasAnyRole('STUDENT', 'FACULTY', 'MENTOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<AttendanceResponse>> markAttendance(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody MarkAttendanceRequest request,
            HttpServletRequest httpServletRequest) {

        String ipAddress = httpServletRequest.getRemoteAddr();
        String userRole = userDetails.getAuthorities().stream()
                .findFirst().map(a -> a.getAuthority().replace("ROLE_", "")).orElse("STUDENT");

        AttendanceResponse response = attendanceService.markAttendance(
                userDetails.getUsername(),
                userRole,
                userDetails.getUsername(),
                request,
                ipAddress
        );

        return ResponseEntity.ok(ApiResponse.success("Attendance marked successfully!", response));
    }

    // --- BATCH-WISE ATTENDANCE SYSTEM APIS ---

    @PostMapping("/sessions")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<ApiResponse<AttendanceSession>> createSession(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody AttendanceSessionRequest request) {
        AttendanceSession session = attendanceService.createAttendanceSession(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Attendance session created successfully", session));
    }

    @PostMapping("/sessions/{sessionId}/start")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<ApiResponse<AttendanceSession>> startSession(@PathVariable Long sessionId) {
        AttendanceSession session = attendanceService.startAttendanceSession(sessionId);
        return ResponseEntity.ok(ApiResponse.success("Attendance session started", session));
    }

    @PostMapping("/scan")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<ApiResponse<AttendanceResponse>> scanQr(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody QrScanRequest request) {
        AttendanceResponse response = attendanceService.processQrScan(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Attendance Marked", response));
    }

    @PostMapping("/sessions/{sessionId}/close")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<ApiResponse<AttendanceSession>> closeSession(@PathVariable Long sessionId) {
        AttendanceSession session = attendanceService.closeAttendanceSession(sessionId);
        return ResponseEntity.ok(ApiResponse.success("Attendance session closed", session));
    }

    @GetMapping("/batch/{batchId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'FACULTY', 'ADMIN')")
    public ResponseEntity<ApiResponse<BatchAttendanceResponse>> getBatchAttendance(@PathVariable Long batchId) {
        BatchAttendanceResponse response = attendanceService.getBatchAttendance(batchId);
        return ResponseEntity.ok(ApiResponse.success("Batch attendance fetched successfully", response));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'FACULTY', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getStudentAttendance(@PathVariable Long studentId) {
        List<AttendanceResponse> response = attendanceService.getStudentAttendance(studentId);
        return ResponseEntity.ok(ApiResponse.success("Student attendance records fetched", response));
    }

    @GetMapping("/student/{studentId}/batch/{batchId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'FACULTY', 'ADMIN')")
    public ResponseEntity<ApiResponse<BatchAttendanceResponse>> getStudentBatchAttendance(
            @PathVariable Long studentId,
            @PathVariable Long batchId) {
        BatchAttendanceResponse response = attendanceService.getStudentBatchAttendance(studentId, batchId);
        return ResponseEntity.ok(ApiResponse.success("Student batch attendance fetched", response));
    }

    @GetMapping("/session/{sessionId}")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<ApiResponse<AttendanceSummaryResponse>> getSessionAttendanceStats(@PathVariable Long sessionId) {
        AttendanceSummaryResponse response = attendanceService.getSessionAttendanceStats(sessionId);
        return ResponseEntity.ok(ApiResponse.success("Session attendance stats fetched", response));
    }

    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('STUDENT', 'FACULTY', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> searchHistory(
            @RequestParam(required = false) Long batchId,
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) AttendanceStatus status) {
        List<AttendanceResponse> response = attendanceService.searchAttendanceHistory(batchId, subjectId, startDate, endDate, status);
        return ResponseEntity.ok(ApiResponse.success("Attendance history records fetched", response));
    }

    @GetMapping("/status/today")
    @PreAuthorize("hasAnyRole('STUDENT', 'FACULTY', 'ADMIN')")
    public ResponseEntity<ApiResponse<Boolean>> checkTodayStatus(@AuthenticationPrincipal CustomUserDetails userDetails) {
        boolean marked = attendanceService.hasUserMarkedToday(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Checked attendance status", marked));
    }

    @GetMapping("/my-summary")
    @PreAuthorize("hasAnyRole('STUDENT', 'FACULTY', 'MENTOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<AttendanceSummaryResponse>> getMySummary(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        AttendanceSummaryResponse response = attendanceService.getMyAttendanceSummary(userDetails.getUsername(), startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Fetched attendance summary", response));
    }

    @GetMapping("/date/{date}")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getAttendanceByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<AttendanceResponse> response = attendanceService.getAttendanceByDate(date);
        return ResponseEntity.ok(ApiResponse.success("Fetched attendance records for " + date, response));
    }

    @GetMapping("/report")
    @PreAuthorize("hasAnyRole('STUDENT', 'FACULTY', 'MENTOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getAttendanceReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<AttendanceResponse> response = attendanceService.getAttendanceReport(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Fetched attendance report", response));
    }

    @PostMapping("/manual")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<ApiResponse<AttendanceResponse>> recordManualAttendance(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam String studentEmail,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam AttendanceStatus status) {
        AttendanceResponse response = attendanceService.recordManualAttendance(studentEmail, date, status, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Manual attendance updated", response));
    }

    @GetMapping("/export/pdf")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<byte[]> exportPdfReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        byte[] pdfBytes = reportExportService.generateAttendancePdfReport(startDate, endDate);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=attendance_report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/export/excel")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<byte[]> exportExcelReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        byte[] excelBytes = reportExportService.generateAttendanceExcelReport(startDate, endDate);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=attendance_report.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelBytes);
    }

    @GetMapping("/export/csv")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<byte[]> exportCsvReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        byte[] csvBytes = reportExportService.generateAttendanceCsvReport(startDate, endDate);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=attendance_report.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }
}
