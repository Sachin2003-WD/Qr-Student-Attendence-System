package com.mentormatrix.repository;

import com.mentormatrix.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {
    Optional<Admin> findByUserEmailAndDeletedFalse(String email);
    Optional<Admin> findByUserPhoneAndDeletedFalse(String phone);

    default Optional<Admin> findByEmailAndDeletedFalse(String email) {
        return findByUserEmailAndDeletedFalse(email);
    }
    default Optional<Admin> findByPhoneAndDeletedFalse(String phone) {
        return findByUserPhoneAndDeletedFalse(phone);
    }
    default boolean existsByEmailAndDeletedFalse(String email) {
        return findByUserEmailAndDeletedFalse(email).isPresent();
    }
    default boolean existsByPhoneAndDeletedFalse(String phone) {
        return findByUserPhoneAndDeletedFalse(phone).isPresent();
    }

    long countByDeletedFalse();
    List<Admin> findAllByDeletedFalse();
}
