package com.mentormatrix.repository;

import com.mentormatrix.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {
    Optional<Admin> findByUserEmailAndDeletedFalse(String email);
    Optional<Admin> findByUserPhoneAndDeletedFalse(String phone);

    @Query("SELECT a FROM Admin a WHERE a.deleted = false AND (LOWER(a.email) = LOWER(:email) OR (a.user IS NOT NULL AND LOWER(a.user.email) = LOWER(:email)))")
    Optional<Admin> findByEmailIgnoreCase(@Param("email") String email);

    default Optional<Admin> findByEmailAndDeletedFalse(String email) {
        if (email == null) return Optional.empty();
        String cleanEmail = email.trim().toLowerCase();
        Optional<Admin> res = findByEmailIgnoreCase(cleanEmail);
        return res.isPresent() ? res : findByUserEmailAndDeletedFalse(cleanEmail);
    }
    default Optional<Admin> findByPhoneAndDeletedFalse(String phone) {
        return findByUserPhoneAndDeletedFalse(phone);
    }
    default boolean existsByEmailAndDeletedFalse(String email) {
        return findByEmailAndDeletedFalse(email).isPresent();
    }
    default boolean existsByPhoneAndDeletedFalse(String phone) {
        return findByUserPhoneAndDeletedFalse(phone).isPresent();
    }

    long countByDeletedFalse();
    List<Admin> findAllByDeletedFalse();
}
