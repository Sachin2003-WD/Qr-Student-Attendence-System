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
import com.mentormatrix.repository.UserRepository;
import com.mentormatrix.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminAuthService {

    private final AdminRepository adminRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;
    private final EmailService emailService;
    private final OtpService otpService;
    private final NotificationService notificationService;

    public AdminAuthService(AdminRepository adminRepository, UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil,
                            RefreshTokenService refreshTokenService, EmailService emailService,
                            OtpService otpService, NotificationService notificationService) {
        this.adminRepository = adminRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.refreshTokenService = refreshTokenService;
        this.emailService = emailService;
        this.otpService = otpService;
        this.notificationService = notificationService;
    }

    @Transactional
    public synchronized AuthResponse register(AdminRegistrationRequest request) {
        long adminCount = adminRepository.countByDeletedFalse();
        if (adminCount >= AppConstants.MAX_ADMIN_COUNT) {
            throw new MaxLimitReachedException("Maximum number of admins (" + AppConstants.MAX_ADMIN_COUNT + ") reached.");
        }

        String cleanEmail = request.getEmail().trim().toLowerCase();
        String cleanPhone = request.getPhone().trim();

        if (userRepository.existsByEmailAndDeletedFalse(cleanEmail) || adminRepository.existsByEmailAndDeletedFalse(cleanEmail)) {
            throw new DuplicateResourceException("Email is already registered");
        }
        if (userRepository.existsByPhoneAndDeletedFalse(cleanPhone) || adminRepository.existsByPhoneAndDeletedFalse(cleanPhone)) {
            throw new DuplicateResourceException("Phone number is already registered");
        }

        com.mentormatrix.entity.User user = com.mentormatrix.entity.User.builder()
                .name(request.getName())
                .email(cleanEmail)
                .phone(cleanPhone)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(com.mentormatrix.enums.UserRole.ADMIN)
                .active(true)
                .deleted(false)
                .build();
        user = userRepository.save(user);

        Admin admin = new Admin();
        admin.setUser(user);
        admin.setName(user.getName());
        admin.setEmail(user.getEmail());
        admin.setPhone(user.getPhone());
        admin.setPassword(user.getPassword());
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
        String cleanEmail = request.getEmail().trim().toLowerCase();

        Admin admin = adminRepository.findByEmailAndDeletedFalse(cleanEmail).orElse(null);
        com.mentormatrix.entity.User user = userRepository.findByEmailAndDeletedFalse(cleanEmail).orElse(null);
        if (user == null && admin != null && admin.getUser() != null) {
            user = admin.getUser();
        }

        if (admin == null && user == null) {
            throw new UnauthorizedException("Invalid email or password");
        }

        String passwordHash = admin != null && admin.getPassword() != null ? admin.getPassword() : (user != null ? user.getPassword() : null);
        String name = admin != null && admin.getName() != null ? admin.getName() : (user != null ? user.getName() : "Admin");
        String finalEmail = admin != null && admin.getEmail() != null ? admin.getEmail() : (user != null ? user.getEmail() : cleanEmail);
        Boolean active = admin != null && admin.getActive() != null ? admin.getActive() : (user != null ? user.getActive() : true);

        if (passwordHash == null || !passwordEncoder.matches(request.getPassword(), passwordHash)) {
            throw new UnauthorizedException("Invalid email or password");
        }

        if (!Boolean.TRUE.equals(active)) {
            throw new UnauthorizedException("Account is disabled");
        }

        String accessToken = jwtUtil.generateAccessToken(finalEmail, "ADMIN");
        String refreshToken = refreshTokenService.createRefreshToken(finalEmail, "ADMIN").getToken();

        AuthResponse authResponse = new AuthResponse();
        authResponse.setAccessToken(accessToken);
        authResponse.setRefreshToken(refreshToken);
        authResponse.setTokenType("Bearer ");
        authResponse.setEmail(finalEmail);
        authResponse.setName(name);
        authResponse.setRole("ADMIN");
        authResponse.setExpiresIn(jwtUtil.getAccessTokenExpirationMs());

        return authResponse;
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        String cleanEmail = request.getEmail().trim().toLowerCase();
        Admin admin = adminRepository.findByEmailAndDeletedFalse(cleanEmail).orElse(null);
        com.mentormatrix.entity.User user = userRepository.findByEmailAndDeletedFalse(cleanEmail).orElse(null);

        if (admin == null && user == null) {
            throw new ResourceNotFoundException("No administrator found with email: " + cleanEmail);
        }

        String targetEmail = admin != null ? admin.getEmail() : (user != null ? user.getEmail() : cleanEmail);
        String otp = otpService.generateOtp(targetEmail);
        emailService.sendOtpEmail(targetEmail, otp);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        String cleanEmail = request.getEmail().trim().toLowerCase();

        if (!otpService.validateOtp(cleanEmail, request.getOtp().trim())) {
            throw new UnauthorizedException("Invalid or expired OTP code. Please check your email or request a new OTP.");
        }

        Admin admin = adminRepository.findByEmailAndDeletedFalse(cleanEmail).orElse(null);
        com.mentormatrix.entity.User user = userRepository.findByEmailAndDeletedFalse(cleanEmail).orElse(null);

        if (admin == null && user == null) {
            throw new ResourceNotFoundException("Administrator not found for email: " + cleanEmail);
        }

        String encodedPassword = passwordEncoder.encode(request.getNewPassword());
        if (admin != null) {
            admin.setPassword(encodedPassword);
            adminRepository.save(admin);
        }
        if (user != null) {
            user.setPassword(encodedPassword);
            userRepository.save(user);
        }

        otpService.clearOtp(cleanEmail);
        String adminName = admin != null ? admin.getName() : (user != null ? user.getName() : "Administrator");
        emailService.sendPasswordChangedEmail(cleanEmail, adminName);
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
