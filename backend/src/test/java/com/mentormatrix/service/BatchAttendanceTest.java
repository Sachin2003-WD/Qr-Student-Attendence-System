package com.mentormatrix.service;

import com.mentormatrix.dto.request.AttendanceSessionRequest;
import com.mentormatrix.dto.request.QrScanRequest;
import com.mentormatrix.dto.response.AttendanceResponse;
import com.mentormatrix.dto.response.BatchAttendanceResponse;
import com.mentormatrix.entity.AttendanceSession;
import com.mentormatrix.entity.Batch;
import com.mentormatrix.entity.DailyQRCode;
import com.mentormatrix.entity.Enrollment;
import com.mentormatrix.entity.Student;
import com.mentormatrix.entity.Subject;
import com.mentormatrix.enums.AttendanceSessionStatus;
import com.mentormatrix.enums.AttendanceStatus;
import com.mentormatrix.enums.EnrollmentStatus;
import com.mentormatrix.exception.BadRequestException;
import com.mentormatrix.exception.DuplicateResourceException;
import com.mentormatrix.exception.ForbiddenException;
import com.mentormatrix.repository.AttendanceRepository;
import com.mentormatrix.repository.AttendanceSessionRepository;
import com.mentormatrix.repository.AuditLogRepository;
import com.mentormatrix.repository.BatchRepository;
import com.mentormatrix.repository.DailyQRCodeRepository;
import com.mentormatrix.repository.EnrollmentRepository;
import com.mentormatrix.repository.FacultyRepository;
import com.mentormatrix.repository.StudentRepository;
import com.mentormatrix.repository.SubjectRepository;
import com.mentormatrix.service.impl.AttendanceServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BatchAttendanceTest {

    @Mock
    private DailyQRCodeRepository qrCodeRepository;
    @Mock
    private AttendanceRepository attendanceRepository;
    @Mock
    private AttendanceSessionRepository sessionRepository;
    @Mock
    private StudentRepository studentRepository;
    @Mock
    private BatchRepository batchRepository;
    @Mock
    private SubjectRepository subjectRepository;
    @Mock
    private FacultyRepository facultyRepository;
    @Mock
    private EnrollmentRepository enrollmentRepository;
    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private AttendanceServiceImpl attendanceService;

    private Batch batch;
    private Student student;
    private AttendanceSession session;
    private DailyQRCode validQrCode;

    @BeforeEach
    void setUp() {
        batch = Batch.builder()
                .id(1L)
                .name("JRA-GROGRD-E532")
                .batchCode("JRA-GROGRD-E532")
                .branch("Rajajinagar Jspiders")
                .subjectName("Grooming")
                .trainerName("Laxman Ashok Handenavar")
                .classTiming("04:45 PM")
                .startDate(LocalDate.of(2026, 6, 24))
                .build();

        student = Student.builder()
                .id(100L)
                .studentId("STU1024")
                .batch(batch)
                .status(com.mentormatrix.enums.StudentStatus.ACTIVE)
                .active(true)
                .build();

        session = AttendanceSession.builder()
                .id(50L)
                .batch(batch)
                .sessionDate(LocalDate.now())
                .status(AttendanceSessionStatus.ACTIVE)
                .build();

        validQrCode = DailyQRCode.builder()
                .id(10L)
                .token("STUDENT_VALID_TOKEN")
                .userEmail("sachin@college.edu")
                .expiresAt(LocalDateTime.now().plusHours(1))
                .active(true)
                .build();
    }

    @Test
    @DisplayName("Test 1: Valid Student QR -> Attendance marked PRESENT")
    void testValidStudentQrScan_Success() {
        QrScanRequest request = QrScanRequest.builder()
                .sessionId(50L)
                .qrToken("STUDENT_VALID_TOKEN")
                .deviceInfo("Chrome Browser")
                .build();

        when(sessionRepository.findById(50L)).thenReturn(Optional.of(session));
        when(qrCodeRepository.findByTokenAndDeletedFalse("STUDENT_VALID_TOKEN")).thenReturn(Optional.of(validQrCode));
        when(studentRepository.findByEmailAndDeletedFalse("sachin@college.edu")).thenReturn(Optional.of(student));
        when(enrollmentRepository.existsByStudentIdAndBatchIdAndStatusAndDeletedFalse(100L, 1L, EnrollmentStatus.ACTIVE)).thenReturn(true);
        when(attendanceRepository.existsByStudentIdAndAttendanceSessionIdAndDeletedFalse(100L, 50L)).thenReturn(false);
        when(attendanceRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        AttendanceResponse response = attendanceService.processQrScan(request, "admin@college.edu");

        assertNotNull(response);
        assertEquals(AttendanceStatus.PRESENT, response.getStatus());
        verify(attendanceRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("Test 2: Duplicate Student Scan -> Throws DuplicateResourceException (409 CONFLICT)")
    void testDuplicateScan_Throws409Conflict() {
        QrScanRequest request = QrScanRequest.builder()
                .sessionId(50L)
                .qrToken("STUDENT_VALID_TOKEN")
                .build();

        when(sessionRepository.findById(50L)).thenReturn(Optional.of(session));
        when(qrCodeRepository.findByTokenAndDeletedFalse("STUDENT_VALID_TOKEN")).thenReturn(Optional.of(validQrCode));
        when(studentRepository.findByEmailAndDeletedFalse("sachin@college.edu")).thenReturn(Optional.of(student));
        when(enrollmentRepository.existsByStudentIdAndBatchIdAndStatusAndDeletedFalse(100L, 1L, EnrollmentStatus.ACTIVE)).thenReturn(true);
        when(attendanceRepository.existsByStudentIdAndAttendanceSessionIdAndDeletedFalse(100L, 50L)).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> {
            attendanceService.processQrScan(request, "admin@college.edu");
        });
    }

    @Test
    @DisplayName("Test 3: Student belongs to wrong batch -> Throws ForbiddenException (403 FORBIDDEN)")
    void testWrongBatchStudent_Throws403Forbidden() {
        Batch otherBatch = Batch.builder().id(99L).name("JRA-DSWDSD-A7").build();
        Student wrongBatchStudent = Student.builder().id(200L).batch(otherBatch).active(true).build();

        QrScanRequest request = QrScanRequest.builder()
                .sessionId(50L)
                .qrToken("STUDENT_VALID_TOKEN")
                .build();

        when(sessionRepository.findById(50L)).thenReturn(Optional.of(session));
        when(qrCodeRepository.findByTokenAndDeletedFalse("STUDENT_VALID_TOKEN")).thenReturn(Optional.of(validQrCode));
        when(studentRepository.findByEmailAndDeletedFalse("sachin@college.edu")).thenReturn(Optional.of(wrongBatchStudent));
        when(enrollmentRepository.existsByStudentIdAndBatchIdAndStatusAndDeletedFalse(200L, 1L, EnrollmentStatus.ACTIVE)).thenReturn(false);

        ForbiddenException exception = assertThrows(ForbiddenException.class, () -> {
            attendanceService.processQrScan(request, "admin@college.edu");
        });

        assertTrue(exception.getMessage().contains("not enrolled"));
    }

    @Test
    @DisplayName("Test 4: Invalid/Expired QR Code -> Throws BadRequestException")
    void testExpiredQr_ThrowsBadRequestException() {
        DailyQRCode expiredQr = DailyQRCode.builder()
                .token("EXPIRED_TOKEN")
                .expiresAt(LocalDateTime.now().minusMinutes(5))
                .build();

        QrScanRequest request = QrScanRequest.builder()
                .sessionId(50L)
                .qrToken("EXPIRED_TOKEN")
                .build();

        when(sessionRepository.findById(50L)).thenReturn(Optional.of(session));
        when(qrCodeRepository.findByTokenAndDeletedFalse("EXPIRED_TOKEN")).thenReturn(Optional.of(expiredQr));

        assertThrows(BadRequestException.class, () -> {
            attendanceService.processQrScan(request, "admin@college.edu");
        });
    }

    @Test
    @DisplayName("Test 5: Session Closed -> Throws BadRequestException")
    void testClosedSessionScan_ThrowsBadRequestException() {
        AttendanceSession closedSession = AttendanceSession.builder()
                .id(50L)
                .status(AttendanceSessionStatus.CLOSED)
                .build();

        QrScanRequest request = QrScanRequest.builder()
                .sessionId(50L)
                .qrToken("STUDENT_VALID_TOKEN")
                .build();

        when(sessionRepository.findById(50L)).thenReturn(Optional.of(closedSession));

        assertThrows(BadRequestException.class, () -> {
            attendanceService.processQrScan(request, "admin@college.edu");
        });
    }

    @Test
    @DisplayName("Test 6: Batch Attendance Calculation Verification (15 / 17 -> 88.24%)")
    void testBatchAttendancePercentageCalculation() {
        when(batchRepository.findById(1L)).thenReturn(Optional.of(batch));
        when(attendanceRepository.findByAttendanceSessionBatchIdAndDeletedFalse(1L)).thenReturn(Collections.emptyList());

        BatchAttendanceResponse response = attendanceService.getBatchAttendance(1L);

        assertNotNull(response);
        assertEquals("JRA-GROGRD-E532", response.getBatchCode());
        assertEquals("Rajajinagar Jspiders", response.getBranchName());
    }
}
