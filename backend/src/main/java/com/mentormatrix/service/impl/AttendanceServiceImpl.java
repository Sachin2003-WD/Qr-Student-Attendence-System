package com.mentormatrix.service.impl;

import com.mentormatrix.dto.request.AttendanceSessionRequest;
import com.mentormatrix.dto.request.MarkAttendanceRequest;
import com.mentormatrix.dto.request.QrScanRequest;
import com.mentormatrix.dto.response.AttendanceResponse;
import com.mentormatrix.dto.response.AttendanceSummaryResponse;
import com.mentormatrix.dto.response.BatchAttendanceResponse;
import com.mentormatrix.dto.response.QRCodeResponse;
import com.mentormatrix.entity.Attendance;
import com.mentormatrix.entity.AttendanceSession;
import com.mentormatrix.entity.AuditLog;
import com.mentormatrix.entity.Batch;
import com.mentormatrix.entity.DailyQRCode;
import com.mentormatrix.entity.Enrollment;
import com.mentormatrix.entity.Faculty;
import com.mentormatrix.entity.Student;
import com.mentormatrix.entity.Subject;
import com.mentormatrix.enums.AttendanceSessionStatus;
import com.mentormatrix.enums.AttendanceStatus;
import com.mentormatrix.enums.EnrollmentStatus;
import com.mentormatrix.exception.BadRequestException;
import com.mentormatrix.exception.DuplicateResourceException;
import com.mentormatrix.exception.ForbiddenException;
import com.mentormatrix.exception.ResourceNotFoundException;
import com.mentormatrix.repository.AttendanceRepository;
import com.mentormatrix.repository.AttendanceSessionRepository;
import com.mentormatrix.repository.AuditLogRepository;
import com.mentormatrix.repository.BatchRepository;
import com.mentormatrix.repository.DailyQRCodeRepository;
import com.mentormatrix.repository.EnrollmentRepository;
import com.mentormatrix.repository.FacultyRepository;
import com.mentormatrix.repository.StudentRepository;
import com.mentormatrix.repository.SubjectRepository;
import com.mentormatrix.service.AttendanceService;
import com.mentormatrix.util.QRCodeGeneratorUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {

    private final DailyQRCodeRepository qrCodeRepository;
    private final AttendanceRepository attendanceRepository;
    private final AttendanceSessionRepository sessionRepository;
    private final StudentRepository studentRepository;
    private final BatchRepository batchRepository;
    private final SubjectRepository subjectRepository;
    private final FacultyRepository facultyRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AuditLogRepository auditLogRepository;

    @Override
    @Transactional
    public QRCodeResponse getOrCreateDailyQRCode(String creatorEmail) {
        LocalDate today = LocalDate.now();
        return qrCodeRepository.findByDateAndDeletedFalse(today)
                .map(this::mapToQRCodeResponse)
                .orElseGet(() -> {
                    String token = "MM-DAILY-" + today + "-" + UUID.randomUUID().toString().substring(0, 8);
                    LocalDateTime expiresAt = LocalDateTime.of(today, LocalTime.MAX);
                    String base64Image = QRCodeGeneratorUtil.generateQRCodeBase64(token, 300, 300);

                    DailyQRCode dailyQRCode = DailyQRCode.builder()
                            .token(token)
                            .qrCodeBase64(base64Image)
                            .date(today)
                            .generatedBy(creatorEmail)
                            .expiresAt(expiresAt)
                            .active(true)
                            .deleted(false)
                            .build();

                    DailyQRCode saved = qrCodeRepository.save(dailyQRCode);
                    return mapToQRCodeResponse(saved);
                });
    }

    @Override
    @Transactional
    public QRCodeResponse generateDynamicStudentQRCode(String studentEmail) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusSeconds(60);
        String token = "MM-STUDENT-" + UUID.randomUUID().toString() + "-" + now.getSecond();
        String base64Image = QRCodeGeneratorUtil.generateQRCodeBase64(token, 300, 300);

        qrCodeRepository.findByUserEmailAndDeletedFalse(studentEmail)
                .ifPresent(existing -> {
                    existing.setDeleted(true);
                    existing.setActive(false);
                    qrCodeRepository.save(existing);
                });

        DailyQRCode qrCode = DailyQRCode.builder()
                .token(token)
                .qrCodeBase64(base64Image)
                .date(LocalDate.now())
                .userEmail(studentEmail)
                .generatedBy(studentEmail)
                .expiresAt(expiresAt)
                .active(true)
                .deleted(false)
                .build();

        DailyQRCode saved = qrCodeRepository.save(qrCode);
        return mapToQRCodeResponse(saved);
    }

    @Override
    @Transactional
    public AttendanceResponse markAttendance(String userEmail, String userRole, String userName, MarkAttendanceRequest request, String ipAddress) {
        LocalDate today = LocalDate.now();

        DailyQRCode qrCode = qrCodeRepository.findByTokenAndDeletedFalse(request.getToken())
                .orElseThrow(() -> new BadRequestException("Invalid or unrecognized QR Code token"));

        if (LocalDateTime.now().isAfter(qrCode.getExpiresAt())) {
            throw new BadRequestException("QR Code has expired. Please refresh and scan again.");
        }

        String targetEmail = (qrCode.getUserEmail() != null) ? qrCode.getUserEmail() : userEmail;
        String targetName = userName;
        String targetRole = userRole;

        if (qrCode.getUserEmail() != null) {
            Student student = studentRepository.findByEmailAndDeletedFalse(qrCode.getUserEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found with email: " + qrCode.getUserEmail()));
            targetName = student.getName();
            targetRole = "STUDENT";
        }

        if (attendanceRepository.existsByUserEmailAndDateAndDeletedFalse(targetEmail, today)) {
            throw new DuplicateResourceException("Attendance already recorded for today (" + today + ")");
        }

        AttendanceStatus status = LocalTime.now().isAfter(LocalTime.of(10, 0)) ? AttendanceStatus.LATE : AttendanceStatus.PRESENT;

        Attendance attendance = Attendance.builder()
                .userEmail(targetEmail)
                .userName(targetName)
                .userRole(targetRole)
                .date(today)
                .attendanceDate(today)
                .attendanceTime(LocalTime.now())
                .markedAt(LocalDateTime.now())
                .status(status)
                .recordedByFacultyEmail("MENTOR".equalsIgnoreCase(userRole) ? userEmail : null)
                .deviceInfo(request.getDeviceInfo())
                .ipAddress(ipAddress)
                .qrToken(request.getToken())
                .active(true)
                .deleted(false)
                .build();

        Attendance saved = attendanceRepository.save(attendance);
        return mapToAttendanceResponse(saved);
    }

    @Override
    public boolean hasUserMarkedToday(String userEmail) {
        return attendanceRepository.existsByUserEmailAndDateAndDeletedFalse(userEmail, LocalDate.now());
    }

    @Override
    public AttendanceSummaryResponse getMyAttendanceSummary(String userEmail, LocalDate startDate, LocalDate endDate) {
        if (startDate == null) startDate = LocalDate.now().minusDays(30);
        if (endDate == null) endDate = LocalDate.now();

        List<Attendance> records = attendanceRepository.findByUserEmailAndDateBetweenAndDeletedFalse(userEmail, startDate, endDate);
        List<AttendanceResponse> responseList = records.stream().map(this::mapToAttendanceResponse).collect(Collectors.toList());

        long totalDays = records.size();
        long presentCount = records.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT).count();
        long absentCount = records.stream().filter(r -> r.getStatus() == AttendanceStatus.ABSENT).count();
        long lateCount = records.stream().filter(r -> r.getStatus() == AttendanceStatus.LATE).count();
        long onLeaveCount = records.stream().filter(r -> r.getStatus() == AttendanceStatus.ON_LEAVE).count();
        long holidayCount = records.stream().filter(r -> r.getStatus() == AttendanceStatus.HOLIDAY).count();

        double percentage = totalDays > 0 ? ((double) (presentCount + lateCount) / totalDays) * 100.0 : 0.0;

        return AttendanceSummaryResponse.builder()
                .totalDays(totalDays)
                .presentCount(presentCount)
                .absentCount(absentCount)
                .lateCount(lateCount)
                .onLeaveCount(onLeaveCount)
                .holidayCount(holidayCount)
                .attendancePercentage(Math.round(percentage * 10.0) / 10.0)
                .records(responseList)
                .build();
    }

    @Override
    public List<AttendanceResponse> getAttendanceByDate(LocalDate date) {
        if (date == null) date = LocalDate.now();
        return attendanceRepository.findByDateAndDeletedFalse(date)
                .stream().map(this::mapToAttendanceResponse).collect(Collectors.toList());
    }

    @Override
    public List<AttendanceResponse> getAttendanceReport(LocalDate startDate, LocalDate endDate) {
        if (startDate == null) startDate = LocalDate.now().minusDays(30);
        if (endDate == null) endDate = LocalDate.now();
        return attendanceRepository.findByDateBetweenAndDeletedFalse(startDate, endDate)
                .stream().map(this::mapToAttendanceResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AttendanceResponse recordManualAttendance(String studentEmail, LocalDate date, AttendanceStatus status, String facultyEmail) {
        final LocalDate targetDate = (date != null) ? date : LocalDate.now();

        Student student = studentRepository.findByEmailAndDeletedFalse(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with email: " + studentEmail));

        Attendance attendance = attendanceRepository.findByUserEmailAndDateAndDeletedFalse(studentEmail, targetDate)
                .orElseGet(() -> Attendance.builder()
                        .userEmail(studentEmail)
                        .userName(student.getName())
                        .userRole("STUDENT")
                        .date(targetDate)
                        .attendanceDate(targetDate)
                        .active(true)
                        .deleted(false)
                        .build());

        attendance.setStatus(status);
        attendance.setMarkedAt(LocalDateTime.now());
        attendance.setRecordedByFacultyEmail(facultyEmail);

        Attendance saved = attendanceRepository.save(attendance);
        return mapToAttendanceResponse(saved);
    }

    // --- REAL BATCH-WISE ATTENDANCE SYSTEM IMPLEMENTATION ---

    @Override
    @Transactional
    public AttendanceSession createAttendanceSession(AttendanceSessionRequest request, String creatorEmail) {
        Batch batch = batchRepository.findById(request.getBatchId())
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found with ID: " + request.getBatchId()));

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with ID: " + request.getSubjectId()));

        Faculty faculty;
        if (request.getFacultyId() != null) {
            faculty = facultyRepository.findById(request.getFacultyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with ID: " + request.getFacultyId()));
        } else {
            faculty = facultyRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("No faculty available for session creation"));
        }

        LocalDate sessionDate = (request.getSessionDate() != null) ? request.getSessionDate() : LocalDate.now();
        LocalTime startTime = (request.getStartTime() != null) ? request.getStartTime() : LocalTime.now();
        String sessionToken = "SESSION-" + batch.getId() + "-" + subject.getCode() + "-" + UUID.randomUUID().toString().substring(0, 8);

        AttendanceSession session = AttendanceSession.builder()
                .batch(batch)
                .subject(subject)
                .faculty(faculty)
                .sessionDate(sessionDate)
                .startTime(startTime)
                .endTime(request.getEndTime())
                .status(AttendanceSessionStatus.ACTIVE)
                .qrToken(sessionToken)
                .qrExpiresAt(LocalDateTime.now().plusHours(2))
                .active(true)
                .deleted(false)
                .build();

        return sessionRepository.save(session);
    }

    @Override
    @Transactional
    public AttendanceSession startAttendanceSession(Long sessionId) {
        AttendanceSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance Session not found with ID: " + sessionId));
        session.setStatus(AttendanceSessionStatus.ACTIVE);
        return sessionRepository.save(session);
    }

    @Override
    @Transactional
    public AttendanceSession closeAttendanceSession(Long sessionId) {
        AttendanceSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance Session not found with ID: " + sessionId));

        session.setStatus(AttendanceSessionStatus.CLOSED);
        session.setEndTime(LocalTime.now());
        AttendanceSession closedSession = sessionRepository.save(session);

        // Auto-Calculate ABSENT records for students enrolled in the batch who were NOT marked PRESENT
        List<Enrollment> enrollments = enrollmentRepository.findByBatchIdAndStatusAndDeletedFalse(
                closedSession.getBatch().getId(), EnrollmentStatus.ACTIVE);

        for (Enrollment enrollment : enrollments) {
            Student student = enrollment.getStudent();
            boolean alreadyMarked = attendanceRepository.existsByStudentIdAndAttendanceSessionIdAndDeletedFalse(
                    student.getId(), closedSession.getId());

            if (!alreadyMarked) {
                Attendance absentRecord = Attendance.builder()
                        .student(student)
                        .attendanceSession(closedSession)
                        .attendanceDate(closedSession.getSessionDate())
                        .attendanceTime(LocalTime.now())
                        .date(closedSession.getSessionDate())
                        .markedAt(LocalDateTime.now())
                        .status(AttendanceStatus.ABSENT)
                        .userEmail(student.getEmail())
                        .userName(student.getName())
                        .userRole("STUDENT")
                        .remarks("Absent at session close")
                        .active(true)
                        .deleted(false)
                        .build();
                attendanceRepository.save(absentRecord);
            }
        }

        // Audit Log
        AuditLog auditLog = AuditLog.builder()
                .action("SESSION_CLOSED")
                .entityName("AttendanceSession")
                .entityId(sessionId)
                .description("Attendance session closed for batch: " + closedSession.getBatch().getName())
                .active(true)
                .deleted(false)
                .build();
        auditLogRepository.save(auditLog);

        return closedSession;
    }

    @Override
    @Transactional
    public AttendanceResponse processQrScan(QrScanRequest request, String adminOrFacultyEmail) {
        // Step 1: Check Attendance Session existence
        AttendanceSession session = sessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new ResourceNotFoundException("Attendance Session not found with ID: " + request.getSessionId()));

        // Step 2: Check Session Status
        if (session.getStatus() != AttendanceSessionStatus.ACTIVE) {
            throw new BadRequestException("Attendance session is closed.");
        }

        // Step 3: Validate QR Token
        DailyQRCode qrCode = qrCodeRepository.findByTokenAndDeletedFalse(request.getQrToken())
                .orElseThrow(() -> new BadRequestException("Invalid student QR code."));

        if (LocalDateTime.now().isAfter(qrCode.getExpiresAt())) {
            throw new BadRequestException("QR code expired. Please generate a new QR code.");
        }

        String studentEmail = qrCode.getUserEmail();
        if (studentEmail == null) {
            studentEmail = qrCode.getGeneratedBy();
        }

        // Step 4: Find Student
        Student student = studentRepository.findByEmailAndDeletedFalse(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found for QR token: " + request.getQrToken()));

        if (!student.getActive()) {
            throw new BadRequestException("Student account is inactive.");
        }

        // Step 5: Check Student Batch Enrollment (Strict Rule 10: INVALID BATCH -> HTTP 403 FORBIDDEN)
        boolean enrolled = enrollmentRepository.existsByStudentIdAndBatchIdAndStatusAndDeletedFalse(
                student.getId(), session.getBatch().getId(), EnrollmentStatus.ACTIVE);

        if (!enrolled && (student.getBatch() == null || !student.getBatch().getId().equals(session.getBatch().getId()))) {
            throw new ForbiddenException("Student is not enrolled in the selected batch (" + session.getBatch().getName() + ").");
        }

        // Step 6: Check Duplicate Attendance (Strict Rule 9: DUPLICATE ATTENDANCE -> HTTP 409 CONFLICT)
        if (attendanceRepository.existsByStudentIdAndAttendanceSessionIdAndDeletedFalse(student.getId(), session.getId())) {
            throw new DuplicateResourceException("Attendance already marked for this session.");
        }

        // Step 7: Create Attendance Record
        Attendance attendance = Attendance.builder()
                .student(student)
                .attendanceSession(session)
                .attendanceDate(session.getSessionDate())
                .attendanceTime(LocalTime.now())
                .date(session.getSessionDate())
                .markedAt(LocalDateTime.now())
                .status(AttendanceStatus.PRESENT)
                .userEmail(student.getEmail())
                .userName(student.getName())
                .userRole("STUDENT")
                .recordedByFacultyEmail(adminOrFacultyEmail)
                .deviceInfo(request.getDeviceInfo())
                .qrToken(request.getQrToken())
                .active(true)
                .deleted(false)
                .build();

        Attendance saved = attendanceRepository.save(attendance);

        // Audit log
        AuditLog auditLog = AuditLog.builder()
                .action("ATTENDANCE_MARKED")
                .entityName("Attendance")
                .entityId(saved.getId())
                .description("Attendance marked PRESENT for student " + student.getName() + " in session " + session.getId())
                .active(true)
                .deleted(false)
                .build();
        auditLogRepository.save(auditLog);

        return mapToAttendanceResponse(saved);
    }

    @Override
    public BatchAttendanceResponse getBatchAttendance(Long batchId) {
        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found with ID: " + batchId));

        List<Attendance> records = attendanceRepository.findByAttendanceSessionBatchIdAndDeletedFalse(batchId);
        List<AttendanceResponse> responseList = records.stream().map(this::mapToAttendanceResponse).collect(Collectors.toList());

        long totalClasses = records.stream().map(r -> r.getAttendanceSession().getId()).distinct().count();
        long presentCount = records.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT).count();
        long absentCount = records.stream().filter(r -> r.getStatus() == AttendanceStatus.ABSENT).count();
        long totalScans = records.size();

        double percentage = totalScans > 0 ? ((double) presentCount / totalScans) * 100.0 : 0.0;

        return BatchAttendanceResponse.builder()
                .batchId(batch.getId())
                .batchCode(batch.getBatchCode() != null ? batch.getBatchCode() : batch.getName())
                .batchName(batch.getName())
                .subjectName(batch.getSubjectName() != null ? batch.getSubjectName() : "Core Subject")
                .branchName(batch.getBranch() != null ? batch.getBranch() : "Main Branch")
                .trainerName(batch.getTrainerName() != null ? batch.getTrainerName() : "Faculty Trainer")
                .classTiming(batch.getClassTiming() != null ? batch.getClassTiming() : "04:45 PM")
                .startDate(batch.getStartDate() != null ? batch.getStartDate().toString() : "2026-06-24")
                .totalClasses(Math.max(totalClasses, 1))
                .classesAttended(presentCount)
                .classesAbsent(absentCount)
                .attendancePercentage(Math.round(percentage * 100.0) / 100.0)
                .records(responseList)
                .build();
    }

    @Override
    public BatchAttendanceResponse getStudentBatchAttendance(Long studentId, Long batchId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));

        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found with ID: " + batchId));

        List<Attendance> records = attendanceRepository.findByStudentIdAndAttendanceSessionBatchIdAndDeletedFalseOrderByAttendanceDateDesc(studentId, batchId);
        List<AttendanceResponse> responseList = records.stream().map(this::mapToAttendanceResponse).collect(Collectors.toList());

        long totalSessions = sessionRepository.findByBatchIdAndSessionDateAndDeletedFalse(batchId, LocalDate.now()).size();
        long totalClasses = Math.max(records.size(), totalSessions);
        long presentCount = records.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT).count();
        long absentCount = records.stream().filter(r -> r.getStatus() == AttendanceStatus.ABSENT).count();

        double percentage = totalClasses > 0 ? ((double) presentCount / totalClasses) * 100.0 : 0.0;

        return BatchAttendanceResponse.builder()
                .batchId(batch.getId())
                .batchCode(batch.getBatchCode() != null ? batch.getBatchCode() : batch.getName())
                .batchName(batch.getName())
                .subjectName(batch.getSubjectName() != null ? batch.getSubjectName() : "Grooming")
                .branchName(batch.getBranch() != null ? batch.getBranch() : "Rajajinagar Jspiders")
                .trainerName(batch.getTrainerName() != null ? batch.getTrainerName() : "Laxman Ashok Handenavar")
                .classTiming(batch.getClassTiming() != null ? batch.getClassTiming() : "04:45 PM")
                .startDate(batch.getStartDate() != null ? batch.getStartDate().toString() : "2026-06-24")
                .totalClasses(Math.max(totalClasses, 1))
                .classesAttended(presentCount)
                .classesAbsent(absentCount)
                .attendancePercentage(Math.round(percentage * 100.0) / 100.0)
                .records(responseList)
                .build();
    }

    @Override
    public List<AttendanceResponse> getStudentAttendance(Long studentId) {
        return attendanceRepository.findByStudentIdAndDeletedFalseOrderByAttendanceDateDesc(studentId)
                .stream().map(this::mapToAttendanceResponse).collect(Collectors.toList());
    }

    @Override
    public AttendanceSummaryResponse getSessionAttendanceStats(Long sessionId) {
        AttendanceSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance Session not found with ID: " + sessionId));

        List<Attendance> records = attendanceRepository.findByAttendanceSessionIdAndDeletedFalse(sessionId);
        List<AttendanceResponse> responseList = records.stream().map(this::mapToAttendanceResponse).collect(Collectors.toList());

        long totalEnrolled = enrollmentRepository.findByBatchIdAndStatusAndDeletedFalse(
                session.getBatch().getId(), EnrollmentStatus.ACTIVE).size();
        long presentCount = records.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT).count();
        long absentCount = totalEnrolled > presentCount ? (totalEnrolled - presentCount) : 0;

        double percentage = totalEnrolled > 0 ? ((double) presentCount / totalEnrolled) * 100.0 : 0.0;

        return AttendanceSummaryResponse.builder()
                .totalDays(totalEnrolled)
                .presentCount(presentCount)
                .absentCount(absentCount)
                .lateCount(records.stream().filter(r -> r.getStatus() == AttendanceStatus.LATE).count())
                .attendancePercentage(Math.round(percentage * 100.0) / 100.0)
                .records(responseList)
                .build();
    }

    @Override
    public List<AttendanceResponse> searchAttendanceHistory(Long batchId, Long subjectId, LocalDate startDate, LocalDate endDate, AttendanceStatus status) {
        List<Attendance> records = attendanceRepository.findAll();
        return records.stream()
                .filter(r -> !r.getDeleted())
                .filter(r -> batchId == null || (r.getAttendanceSession() != null && r.getAttendanceSession().getBatch().getId().equals(batchId)))
                .filter(r -> subjectId == null || (r.getAttendanceSession() != null && r.getAttendanceSession().getSubject().getId().equals(subjectId)))
                .filter(r -> startDate == null || (r.getAttendanceDate() != null && !r.getAttendanceDate().isBefore(startDate)))
                .filter(r -> endDate == null || (r.getAttendanceDate() != null && !r.getAttendanceDate().isAfter(endDate)))
                .filter(r -> status == null || r.getStatus() == status)
                .map(this::mapToAttendanceResponse)
                .collect(Collectors.toList());
    }

    private QRCodeResponse mapToQRCodeResponse(DailyQRCode qrCode) {
        return QRCodeResponse.builder()
                .date(qrCode.getDate())
                .token(qrCode.getToken())
                .qrCodeBase64(qrCode.getQrCodeBase64())
                .expiresAt(qrCode.getExpiresAt())
                .userEmail(qrCode.getUserEmail())
                .build();
    }

    private AttendanceResponse mapToAttendanceResponse(Attendance attendance) {
        String subjCode = "CS301";
        String subjName = "Grooming";
        String sessTime = "04:45 PM";

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
