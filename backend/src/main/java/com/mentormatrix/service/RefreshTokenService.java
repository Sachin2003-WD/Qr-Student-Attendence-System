package com.mentormatrix.service;

import com.mentormatrix.dto.response.AuthResponse;
import com.mentormatrix.entity.RefreshToken;
import com.mentormatrix.exception.UnauthorizedException;
import com.mentormatrix.repository.RefreshTokenRepository;
import com.mentormatrix.security.JwtUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtUtil jwtUtil;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository, JwtUtil jwtUtil) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public RefreshToken createRefreshToken(String email, String roleStr) {
        refreshTokenRepository.deleteByUserEmailAndUserRole(email, roleStr);

        RefreshToken refreshToken = RefreshToken.builder()
                .userEmail(email)
                .userRole(roleStr)
                .token(UUID.randomUUID().toString())
                .expiryDate(LocalDateTime.now().plusSeconds(jwtUtil.getAccessTokenExpirationMs() / 1000 * 24 * 7)) // 7 days
                .active(true)
                .deleted(false)
                .build();
        
        return refreshTokenRepository.save(refreshToken);
    }

    public RefreshToken verifyRefreshToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByTokenAndDeletedFalse(token)
                .orElseThrow(() -> new UnauthorizedException("Refresh token is not in database!"));

        if (refreshToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new UnauthorizedException("Refresh token was expired. Please make a new signin request");
        }

        return refreshToken;
    }

    @Transactional
    public void deleteByUserEmailAndRole(String email, String role) {
        refreshTokenRepository.deleteByUserEmailAndUserRole(email, role);
    }

    public AuthResponse refreshAccessToken(String refreshTokenStr) {
        RefreshToken refreshToken = verifyRefreshToken(refreshTokenStr);
        String email = refreshToken.getUserEmail();
        String role = refreshToken.getUserRole();
        
        String accessToken = jwtUtil.generateAccessToken(email, role);
        
        AuthResponse response = new AuthResponse();
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshToken.getToken());
        response.setTokenType("Bearer ");
        response.setEmail(email);
        response.setRole(role);
        response.setExpiresIn(jwtUtil.getAccessTokenExpirationMs());
        
        return response;
    }
}
