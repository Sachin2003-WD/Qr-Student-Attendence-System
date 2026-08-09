package com.mentormatrix.repository;

import com.mentormatrix.entity.Faculty;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FacultyRepository extends JpaRepository<Faculty, Long> {
    Optional<Faculty> findByFacultyIdAndDeletedFalse(String facultyId);
    Optional<Faculty> findByUserEmailAndDeletedFalse(String email);
    boolean existsByFacultyIdAndDeletedFalse(String facultyId);
    Page<Faculty> findByDepartmentIdAndDeletedFalse(Long departmentId, Pageable pageable);
    long countByDeletedFalse();
}
