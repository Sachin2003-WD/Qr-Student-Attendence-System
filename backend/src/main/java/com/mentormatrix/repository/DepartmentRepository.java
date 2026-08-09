package com.mentormatrix.repository;

import com.mentormatrix.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    Optional<Department> findByCodeAndDeletedFalse(String code);
    Optional<Department> findByNameAndDeletedFalse(String name);
    boolean existsByCodeAndDeletedFalse(String code);
    boolean existsByNameAndDeletedFalse(String name);
}
