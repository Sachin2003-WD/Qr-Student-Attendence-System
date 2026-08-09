package com.mentormatrix.repository;

import com.mentormatrix.entity.Batch;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BatchRepository extends JpaRepository<Batch, Long> {
    Optional<Batch> findByBatchCodeAndDeletedFalse(String batchCode);
    List<Batch> findByDeletedFalse();
    Page<Batch> findByCourseIdAndDeletedFalse(Long courseId, Pageable pageable);
    List<Batch> findByCourseIdAndDeletedFalse(Long courseId);
}
