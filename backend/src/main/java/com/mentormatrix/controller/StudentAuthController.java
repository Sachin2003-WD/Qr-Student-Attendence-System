package com.mentormatrix.controller;

import com.mentormatrix.dto.request.*;
import com.mentormatrix.dto.response.AuthResponse;
import com.mentormatrix.response.ApiResponse;
import com.mentormatrix.service.RefreshTokenService;
import com.mentormatrix.service.StudentAuthService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth/student")
@Tag(name = "Student Authentication")
public class StudentAuthController {

    private final StudentAuthService studentAuthService;
    private final RefreshTokenService refreshTokenService;

    public StudentAuthController(StudentAuthService studentAuthService, RefreshTokenService refreshTokenService) {
        this.studentAuthService = studentAuthService;
        this.refreshTokenService = refreshTokenService;
    }

    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody StudentRegistrationRequest request) {
        AuthResponse response = studentAuthService.register(request);
        return ApiResponse.success("Student registered successfully", response);
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = studentAuthService.login(request);
        return ApiResponse.success("Login successful", response);
    }

    @PostMapping("/forgot-password")
    public ApiResponse<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        studentAuthService.forgotPassword(request);
        return ApiResponse.success("OTP sent to your email", null);
    }

    @PostMapping("/reset-password")
    public ApiResponse<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        studentAuthService.resetPassword(request);
        return ApiResponse.success("Password reset successfully", null);
    }

    @PostMapping("/change-password")
    @PreAuthorize("hasRole('STUDENT')")
    public ApiResponse<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            throw new com.mentormatrix.exception.UnauthorizedException("Authentication required to change password");
        }
        studentAuthService.changePassword(auth.getName(), request);
        return ApiResponse.success("Password changed successfully", null);
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            studentAuthService.logout(auth.getName());
        }
        return ApiResponse.success("Logged out successfully", null);
    }

    @PostMapping("/refresh-token")
    public ApiResponse<AuthResponse> refreshToken(@RequestParam String refreshToken) {
        AuthResponse response = refreshTokenService.refreshAccessToken(refreshToken);
        return ApiResponse.success("Token refreshed successfully", response);
    }
}
