package com.mentormatrix.repository;

import com.mentormatrix.entity.Subject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    Optional<Subject> findByCodeAndDeletedFalse(String code);
    boolean existsByCodeAndDeletedFalse(String code);
    Page<Subject> findByCourseIdAndDeletedFalse(Long courseId, Pageable pageable);
    List<Subject> findByCourseIdAndSemesterAndDeletedFalse(Long courseId, Integer semester);
}
