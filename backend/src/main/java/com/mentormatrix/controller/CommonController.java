package com.mentormatrix.controller;

import com.mentormatrix.dto.response.AuthResponse;
import com.mentormatrix.response.ApiResponse;
import com.mentormatrix.service.RefreshTokenService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/common")
@Tag(name = "Common Controller", description = "Common endpoints for the application")
@RequiredArgsConstructor
public class CommonController {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(CommonController.class);

    private final RefreshTokenService refreshTokenService;

    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshAccessToken(@RequestParam String refreshToken) {
        log.info("Refreshing access token");
        AuthResponse authResponse = refreshTokenService.refreshAccessToken(refreshToken);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", authResponse));
    }
}
