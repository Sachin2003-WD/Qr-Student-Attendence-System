package com.mentormatrix.controller;

import com.mentormatrix.dto.request.*;
import com.mentormatrix.dto.response.AuthResponse;
import com.mentormatrix.exception.UnauthorizedException;
import com.mentormatrix.response.ApiResponse;
import com.mentormatrix.service.AdminAuthService;
import com.mentormatrix.service.RefreshTokenService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("")
@Tag(name = "Admin Authentication")
public class AdminAuthController {

    private final AdminAuthService adminAuthService;
    private final RefreshTokenService refreshTokenService;

    public AdminAuthController(AdminAuthService adminAuthService, RefreshTokenService refreshTokenService) {
        this.adminAuthService = adminAuthService;
        this.refreshTokenService = refreshTokenService;
    }

    @PostMapping("/auth/admin/register")
    public ApiResponse<AuthResponse> bootstrapRegister(@Valid @RequestBody AdminRegistrationRequest request) {
        AuthResponse response = adminAuthService.register(request);
        return ApiResponse.success("Admin registered successfully", response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/create-admin")
    public ApiResponse<AuthResponse> createAdmin(@Valid @RequestBody AdminRegistrationRequest request) {
        AuthResponse response = adminAuthService.register(request);
        return ApiResponse.success("Admin created successfully", response);
    }

    @PostMapping("/auth/admin/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = adminAuthService.login(request);
        return ApiResponse.success("Login successful", response);
    }

    @PostMapping("/auth/admin/forgot-password")
    public ApiResponse<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        adminAuthService.forgotPassword(request);
        return ApiResponse.success("OTP sent to your email", null);
    }

    @PostMapping("/auth/admin/reset-password")
    public ApiResponse<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        adminAuthService.resetPassword(request);
        return ApiResponse.success("Password reset successfully", null);
    }

    @PostMapping("/auth/admin/change-password")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            throw new UnauthorizedException("Authentication required to change password");
        }
        adminAuthService.changePassword(auth.getName(), request);
        return ApiResponse.success("Password changed successfully", null);
    }

    @PostMapping("/auth/admin/logout")
    public ApiResponse<Void> logout() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            adminAuthService.logout(auth.getName());
        }
        return ApiResponse.success("Logged out successfully", null);
    }

    @PostMapping("/auth/admin/refresh-token")
    public ApiResponse<AuthResponse> refreshToken(@RequestParam String refreshToken) {
        AuthResponse response = refreshTokenService.refreshAccessToken(refreshToken);
        return ApiResponse.success("Token refreshed successfully", response);
    }
}
