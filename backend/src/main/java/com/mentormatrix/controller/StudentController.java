package com.mentormatrix.controller;

import com.mentormatrix.dto.request.StudentProfileUpdateRequest;
import com.mentormatrix.dto.response.NotificationResponse;
import com.mentormatrix.dto.response.StudentResponse;
import com.mentormatrix.response.ApiResponse;
import com.mentormatrix.service.NotificationService;
import com.mentormatrix.service.StudentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/student")
@Tag(name = "Student Controller", description = "Endpoints for students")
@RequiredArgsConstructor
public class StudentController {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(StudentController.class);

    private final StudentService studentService;
    private final NotificationService notificationService;

    private String getAuthenticatedEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<StudentResponse>> getProfile() {
        log.info("Fetching profile for student");
        StudentResponse profile = studentService.getStudentByEmail(getAuthenticatedEmail());
        return ResponseEntity.ok(ApiResponse.success("Profile fetched successfully", profile));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<StudentResponse>> updateProfile(@Valid @RequestBody StudentProfileUpdateRequest updateRequest) {
        log.info("Updating profile for student");
        StudentResponse updatedProfile = studentService.updateProfile(getAuthenticatedEmail(), updateRequest);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updatedProfile));
    }

    @PostMapping("/profile/image")
    public ResponseEntity<ApiResponse<Void>> uploadProfileImage(@RequestParam("file") MultipartFile file) {
        log.info("Uploading profile image for student");
        studentService.uploadProfileImage(getAuthenticatedEmail(), file);
        return ResponseEntity.ok(ApiResponse.success("Profile image uploaded successfully"));
    }

    @PutMapping("/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivateAccount() {
        log.info("Deactivating student account");
        studentService.deactivateAccount(getAuthenticatedEmail());
        return ResponseEntity.ok(ApiResponse.success("Account deactivated successfully"));
    }

    @DeleteMapping("/account")
    public ResponseEntity<ApiResponse<Void>> deleteAccount() {
        log.info("Deleting student account");
        studentService.deleteAccount(getAuthenticatedEmail());
        return ResponseEntity.ok(ApiResponse.success("Account deleted successfully"));
    }

    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotifications() {
        log.info("Fetching notifications for student");
        List<NotificationResponse> notifications = notificationService.getNotifications(getAuthenticatedEmail());
        return ResponseEntity.ok(ApiResponse.success("Notifications fetched successfully", notifications));
    }

    @GetMapping("/notifications/unread")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getUnreadNotifications() {
        log.info("Fetching unread notifications for student");
        List<NotificationResponse> notifications = notificationService.getUnreadNotifications(getAuthenticatedEmail());
        return ResponseEntity.ok(ApiResponse.success("Unread notifications fetched successfully", notifications));
    }

    @GetMapping("/notifications/unread/count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount() {
        log.info("Fetching unread notifications count for student");
        long count = notificationService.getUnreadCount(getAuthenticatedEmail());
        return ResponseEntity.ok(ApiResponse.success("Unread notifications count fetched successfully", count));
    }

    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markNotificationAsRead(@PathVariable Long id) {
        log.info("Marking notification as read for student");
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read"));
    }

    @PutMapping("/notifications/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllNotificationsAsRead() {
        log.info("Marking all notifications as read for student");
        notificationService.markAllAsRead(getAuthenticatedEmail());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read"));
    }
}
