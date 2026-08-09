package com.mentormatrix.repository;

import com.mentormatrix.entity.User;
import com.mentormatrix.enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailAndDeletedFalse(String email);
    Optional<User> findByPhoneAndDeletedFalse(String phone);
    boolean existsByEmailAndDeletedFalse(String email);
    boolean existsByPhoneAndDeletedFalse(String phone);
    Page<User> findByRoleAndDeletedFalse(UserRole role, Pageable pageable);
    long countByRoleAndDeletedFalse(UserRole role);
}
