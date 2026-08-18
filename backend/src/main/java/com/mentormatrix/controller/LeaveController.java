package com.mentormatrix.controller;

import com.mentormatrix.dto.request.CreateLeaveRequest;
import com.mentormatrix.dto.request.UpdateLeaveStatusRequest;
import com.mentormatrix.dto.response.LeaveResponse;
import com.mentormatrix.enums.LeaveStatus;
import com.mentormatrix.response.ApiResponse;
import com.mentormatrix.security.CustomUserDetails;
import com.mentormatrix.service.LeaveService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/leaves")
@Tag(name = "Leave Requests", description = "Endpoints for student leave applications and admin review")
@RequiredArgsConstructor
@Slf4j
public class LeaveController {

    private final LeaveService leaveService;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<LeaveResponse>> submitLeave(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateLeaveRequest request) {
        log.info("Student {} submitted a leave request", userDetails.getUsername());
        LeaveResponse response = leaveService.submitLeaveRequest(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Leave request submitted successfully", response));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<LeaveResponse>>> getMyLeaves(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<LeaveResponse> list = leaveService.getMyLeaveRequests(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Fetched student leave requests", list));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<LeaveResponse>>> getAllLeaves(
            @RequestParam(required = false) LeaveStatus status) {
        List<LeaveResponse> list = leaveService.getAllLeaveRequests(status);
        return ResponseEntity.ok(ApiResponse.success("Fetched all leave requests", list));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<ApiResponse<LeaveResponse>> updateLeaveStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody UpdateLeaveStatusRequest request) {
        log.info("User {} updated leave request ID {} to {}", userDetails.getUsername(), id, request.getStatus());
        LeaveResponse response = leaveService.updateLeaveStatus(id, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Leave request updated to " + request.getStatus(), response));
    }
}
