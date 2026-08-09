package com.mentormatrix.controller;

import com.mentormatrix.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<ApiResponse<Void>> checkHealth() {
        return ResponseEntity.ok(ApiResponse.success("Smart Attendance System API is running"));
    }
}
