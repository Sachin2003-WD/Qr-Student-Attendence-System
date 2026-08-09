package com.mentormatrix.repository;

import com.mentormatrix.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByTokenAndDeletedFalse(String token);
    void deleteByUserEmailAndUserRole(String userEmail, String userRole);
    Optional<RefreshToken> findByUserEmailAndUserRoleAndDeletedFalse(String userEmail, String userRole);
}
