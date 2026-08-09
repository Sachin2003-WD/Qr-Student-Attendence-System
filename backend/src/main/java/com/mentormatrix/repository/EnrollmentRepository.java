package com.mentormatrix.repository;

import com.mentormatrix.entity.Enrollment;
import com.mentormatrix.enums.EnrollmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    Optional<Enrollment> findByStudentIdAndBatchIdAndStatusAndDeletedFalse(Long studentId, Long batchId, EnrollmentStatus status);
    boolean existsByStudentIdAndBatchIdAndStatusAndDeletedFalse(Long studentId, Long batchId, EnrollmentStatus status);
    List<Enrollment> findByBatchIdAndStatusAndDeletedFalse(Long batchId, EnrollmentStatus status);
    Page<Enrollment> findByBatchIdAndDeletedFalse(Long batchId, Pageable pageable);
}
