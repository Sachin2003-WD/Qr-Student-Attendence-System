package com.mentormatrix.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);

    private final ConcurrentHashMap<String, OtpData> otpStorage = new ConcurrentHashMap<>();
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.otp.expiration-minutes:5}")
    private int expirationMinutes;

    @Value("${app.otp.length:6}")
    private int otpLength;

    public String generateOtp(String email) {
        String cleanEmail = (email != null ? email.trim().toLowerCase() : "");
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < otpLength; i++) {
            otp.append(secureRandom.nextInt(10));
        }

        OtpData otpData = new OtpData(otp.toString(), LocalDateTime.now().plusMinutes(expirationMinutes));
        otpStorage.put(cleanEmail, otpData);

        log.info("Generated OTP for {}", cleanEmail);
        return otp.toString();
    }

    public boolean validateOtp(String email, String otp) {
        String cleanEmail = (email != null ? email.trim().toLowerCase() : "");
        String cleanOtp = (otp != null ? otp.trim() : "");
        
        OtpData otpData = otpStorage.get(cleanEmail);
        if (otpData == null) {
            return false;
        }

        if (LocalDateTime.now().isAfter(otpData.expiry())) {
            otpStorage.remove(cleanEmail);
            return false;
        }

        return otpData.otp().equals(cleanOtp);
    }

    public void clearOtp(String email) {
        String cleanEmail = (email != null ? email.trim().toLowerCase() : "");
        otpStorage.remove(cleanEmail);
    }

    private record OtpData(String otp, LocalDateTime expiry) {}
}
