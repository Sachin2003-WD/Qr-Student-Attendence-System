package com.mentormatrix.repository;

import com.mentormatrix.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByStudentIdAndDeletedFalse(String studentId);
    Optional<Student> findByUserEmailAndDeletedFalse(String email);
    boolean existsByStudentIdAndDeletedFalse(String studentId);
    Page<Student> findAllByDeletedFalse(Pageable pageable);
    List<Student> findAllByDeletedFalse();
    Page<Student> findByDepartmentIdAndDeletedFalse(Long departmentId, Pageable pageable);

    default Optional<Student> findByEmailAndDeletedFalse(String email) {
        return findByUserEmailAndDeletedFalse(email);
    }

    default boolean existsByEmailAndDeletedFalse(String email) {
        return findByUserEmailAndDeletedFalse(email).isPresent();
    }

    default boolean existsByUsnAndDeletedFalse(String usn) {
        return existsByStudentIdAndDeletedFalse(usn);
    }

    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END FROM Student s WHERE s.deleted = false AND s.user IS NOT NULL AND s.user.phone = :phone")
    boolean existsByPhoneAndDeletedFalse(@Param("phone") String phone);

    @Query("SELECT DISTINCT s.department.name FROM Student s WHERE s.deleted = false AND s.department IS NOT NULL")
    List<String> findDistinctDepartments();

    @Query("SELECT COUNT(s) FROM Student s WHERE s.deleted = false AND s.department IS NOT NULL AND s.department.name = :department")
    long countByDepartmentAndDeletedFalse(@Param("department") String department);

    @Query("SELECT s FROM Student s WHERE s.deleted = false AND (LOWER(s.studentId) LIKE LOWER(CONCAT('%', :keyword, '%')) OR (s.user IS NOT NULL AND (LOWER(s.user.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(s.user.email) LIKE LOWER(CONCAT('%', :keyword, '%')))))")
    Page<Student> searchStudents(@Param("keyword") String keyword, Pageable pageable);

    long countByDeletedFalse();
}
