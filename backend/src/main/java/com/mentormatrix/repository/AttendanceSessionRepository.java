package com.mentormatrix.repository;

import com.mentormatrix.entity.AttendanceSession;
import com.mentormatrix.enums.AttendanceSessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, Long> {
    Optional<AttendanceSession> findByQrTokenAndDeletedFalse(String qrToken);
    List<AttendanceSession> findByFacultyIdAndSessionDateAndDeletedFalse(Long facultyId, LocalDate date);
    List<AttendanceSession> findByBatchIdAndSessionDateAndDeletedFalse(Long batchId, LocalDate date);
    List<AttendanceSession> findByStatusAndDeletedFalse(AttendanceSessionStatus status);
}
