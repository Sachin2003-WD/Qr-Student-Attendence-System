package com.mentormatrix.repository;

import com.mentormatrix.entity.Attendance;
import com.mentormatrix.enums.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    Optional<Attendance> findByStudentIdAndAttendanceSessionIdAndDeletedFalse(Long studentId, Long attendanceSessionId);

    boolean existsByStudentIdAndAttendanceSessionIdAndDeletedFalse(Long studentId, Long attendanceSessionId);

    List<Attendance> findByStudentIdAndDeletedFalseOrderByAttendanceDateDesc(Long studentId);

    List<Attendance> findByAttendanceSessionIdAndDeletedFalse(Long attendanceSessionId);

    List<Attendance> findByAttendanceDateAndDeletedFalse(LocalDate date);

    List<Attendance> findByAttendanceDateBetweenAndDeletedFalse(LocalDate startDate, LocalDate endDate);

    long countByStudentIdAndStatusAndDeletedFalse(Long studentId, AttendanceStatus status);

    // Batch-wise queries
    List<Attendance> findByStudentIdAndAttendanceSessionBatchIdAndDeletedFalseOrderByAttendanceDateDesc(Long studentId, Long batchId);

    List<Attendance> findByAttendanceSessionBatchIdAndDeletedFalse(Long batchId);

    long countByStudentIdAndAttendanceSessionBatchIdAndStatusAndDeletedFalse(Long studentId, Long batchId, AttendanceStatus status);

    long countByAttendanceSessionBatchIdAndDeletedFalse(Long batchId);

    long countByAttendanceSessionBatchIdAndStatusAndDeletedFalse(Long batchId, AttendanceStatus status);

    // Backward compatibility methods
    Optional<Attendance> findByUserEmailAndDateAndDeletedFalse(String userEmail, LocalDate date);

    boolean existsByUserEmailAndDateAndDeletedFalse(String userEmail, LocalDate date);

    List<Attendance> findByUserEmailAndDeletedFalseOrderByDateDesc(String userEmail);

    List<Attendance> findByDateAndDeletedFalse(LocalDate date);

    List<Attendance> findByDateBetweenAndDeletedFalse(LocalDate startDate, LocalDate endDate);

    List<Attendance> findByUserEmailAndDateBetweenAndDeletedFalse(String userEmail, LocalDate startDate, LocalDate endDate);

    long countByUserEmailAndDateBetweenAndDeletedFalse(String userEmail, LocalDate startDate, LocalDate endDate);

    long countByUserEmailAndStatusAndDeletedFalse(String userEmail, AttendanceStatus status);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.date = :date AND a.deleted = false")
    long countByDate(@Param("date") LocalDate date);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.date = :date AND a.status = :status AND a.deleted = false")
    long countByDateAndStatus(@Param("date") LocalDate date, @Param("status") AttendanceStatus status);

    @Query("SELECT a FROM Attendance a WHERE a.deleted = false " +
           "AND (:batchId IS NULL OR (a.attendanceSession IS NOT NULL AND a.attendanceSession.batch.id = :batchId)) " +
           "AND (:subjectId IS NULL OR (a.attendanceSession IS NOT NULL AND a.attendanceSession.subject.id = :subjectId)) " +
           "AND (:startDate IS NULL OR (a.attendanceDate >= :startDate OR a.date >= :startDate)) " +
           "AND (:endDate IS NULL OR (a.attendanceDate <= :endDate OR a.date <= :endDate)) " +
           "AND (:status IS NULL OR a.status = :status) " +
           "ORDER BY a.markedAt DESC")
    List<Attendance> searchAttendanceHistory(
            @Param("batchId") Long batchId,
            @Param("subjectId") Long subjectId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("status") AttendanceStatus status);
}
