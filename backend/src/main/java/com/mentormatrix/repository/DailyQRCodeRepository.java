package com.mentormatrix.repository;

import com.mentormatrix.entity.DailyQRCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface DailyQRCodeRepository extends JpaRepository<DailyQRCode, Long> {
    Optional<DailyQRCode> findByDateAndDeletedFalse(LocalDate date);
    Optional<DailyQRCode> findByTokenAndDeletedFalse(String token);
    Optional<DailyQRCode> findByUserEmailAndDeletedFalse(String userEmail);
}
