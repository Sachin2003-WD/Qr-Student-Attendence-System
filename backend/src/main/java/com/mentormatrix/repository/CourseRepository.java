package com.mentormatrix.repository;

import com.mentormatrix.entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    Optional<Course> findByCodeAndDeletedFalse(String code);
    boolean existsByCodeAndDeletedFalse(String code);
    Page<Course> findByDepartmentIdAndDeletedFalse(Long departmentId, Pageable pageable);
}
