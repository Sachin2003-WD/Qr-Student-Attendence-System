package com.mentormatrix.service;

import com.mentormatrix.constants.AppConstants;
import com.mentormatrix.dto.request.*;
import com.mentormatrix.dto.response.AuthResponse;
import com.mentormatrix.entity.Admin;
import com.mentormatrix.enums.Role;
import com.mentormatrix.exception.BadRequestException;
import com.mentormatrix.exception.DuplicateResourceException;
import com.mentormatrix.exception.MaxLimitReachedException;
import com.mentormatrix.exception.ResourceNotFoundException;
import com.mentormatrix.exception.UnauthorizedException;
import com.mentormatrix.repository.AdminRepository;
import com.mentormatrix.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminAuthService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;
    private final EmailService emailService;
    private final OtpService otpService;
    private final NotificationService notificationService;

    public AdminAuthService(AdminRepository adminRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil,
                            RefreshTokenService refreshTokenService, EmailService emailService,
                            OtpService otpService, NotificationService notificationService) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.refreshTokenService = refreshTokenService;
        this.emailService = emailService;
        this.otpService = otpService;
        this.notificationService = notificationService;
    }

    @Transactional
    public AuthResponse register(AdminRegistrationRequest request) {
        long adminCount = adminRepository.countByDeletedFalse();
        if (adminCount >= AppConstants.MAX_ADMIN_COUNT) {
            throw new MaxLimitReachedException("Maximum number of admins (" + AppConstants.MAX_ADMIN_COUNT + ") reached.");
        }

        if (adminRepository.existsByEmailAndDeletedFalse(request.getEmail())) {
            throw new DuplicateResourceException("Email is already registered");
        }
        if (adminRepository.existsByPhoneAndDeletedFalse(request.getPhone())) {
            throw new DuplicateResourceException("Phone number is already registered");
        }

        Admin admin = new Admin();
        admin.setName(request.getName());
        admin.setEmail(request.getEmail());
        admin.setPhone(request.getPhone());
        admin.setPassword(passwordEncoder.encode(request.getPassword()));
        admin.setActive(true);
        admin.setDeleted(false);

        admin = adminRepository.save(admin);

        emailService.sendWelcomeEmail(admin.getEmail(), admin.getName(), "ADMIN");
        notificationService.createNotification(admin.getEmail(), "ADMIN", "Welcome", "Welcome to Mentor Matrix Admin Portal!");

        String accessToken = jwtUtil.generateAccessToken(admin.getEmail(), "ADMIN");
        String refreshToken = refreshTokenService.createRefreshToken(admin.getEmail(), "ADMIN").getToken();

        AuthResponse authResponse = new AuthResponse();
        authResponse.setAccessToken(accessToken);
        authResponse.setRefreshToken(refreshToken);
        authResponse.setTokenType("Bearer ");
        authResponse.setEmail(admin.getEmail());
        authResponse.setName(admin.getName());
        authResponse.setRole("ADMIN");
        authResponse.setExpiresIn(jwtUtil.getAccessTokenExpirationMs());

        return authResponse;
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Admin admin = adminRepository.findByEmailAndDeletedFalse(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!admin.getActive()) {
            throw new UnauthorizedException("Account is disabled");
        }

        if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        String accessToken = jwtUtil.generateAccessToken(admin.getEmail(), "ADMIN");
        String refreshToken = refreshTokenService.createRefreshToken(admin.getEmail(), "ADMIN").getToken();

        AuthResponse authResponse = new AuthResponse();
        authResponse.setAccessToken(accessToken);
        authResponse.setRefreshToken(refreshToken);
        authResponse.setTokenType("Bearer ");
        authResponse.setEmail(admin.getEmail());
        authResponse.setName(admin.getName());
        authResponse.setRole("ADMIN");
        authResponse.setExpiresIn(jwtUtil.getAccessTokenExpirationMs());

        return authResponse;
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        Admin admin = adminRepository.findByEmailAndDeletedFalse(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
        
        String otp = otpService.generateOtp(admin.getEmail());
        emailService.sendOtpEmail(admin.getEmail(), otp);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        if (!otpService.validateOtp(request.getEmail(), request.getOtp())) {
            throw new UnauthorizedException("Invalid or expired OTP");
        }

        Admin admin = adminRepository.findByEmailAndDeletedFalse(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        admin.setPassword(passwordEncoder.encode(request.getNewPassword()));
        adminRepository.save(admin);

        otpService.clearOtp(request.getEmail());
        emailService.sendPasswordChangedEmail(admin.getEmail(), admin.getName());
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        Admin admin = adminRepository.findByEmailAndDeletedFalse(email)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), admin.getPassword())) {
            throw new UnauthorizedException("Incorrect current password");
        }

        admin.setPassword(passwordEncoder.encode(request.getNewPassword()));
        adminRepository.save(admin);

        emailService.sendPasswordChangedEmail(admin.getEmail(), admin.getName());
        notificationService.createNotification(admin.getEmail(), "ADMIN", "Security Alert", "Your password was changed.");
    }

    @Transactional
    public void logout(String email) {
        refreshTokenService.deleteByUserEmailAndRole(email, "ADMIN");
    }
    
    public long getAdminCount() {
        return adminRepository.countByDeletedFalse();
    }
}
