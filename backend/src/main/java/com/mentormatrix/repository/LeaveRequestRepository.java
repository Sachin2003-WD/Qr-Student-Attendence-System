package com.mentormatrix.repository;

import com.mentormatrix.entity.LeaveRequest;
import com.mentormatrix.enums.LeaveStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByStudentIdAndDeletedFalse(Long studentId);
    Page<LeaveRequest> findByStatusAndDeletedFalse(LeaveStatus status, Pageable pageable);
    Page<LeaveRequest> findAllByDeletedFalse(Pageable pageable);
}
