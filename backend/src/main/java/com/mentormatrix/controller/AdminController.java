package com.mentormatrix.controller;

import com.mentormatrix.dto.request.AdminProfileUpdateRequest;
import com.mentormatrix.dto.response.AdminResponse;
import com.mentormatrix.dto.response.DashboardResponse;
import com.mentormatrix.dto.response.NotificationResponse;
import com.mentormatrix.dto.response.StudentResponse;
import com.mentormatrix.response.ApiResponse;
import com.mentormatrix.response.PagedResponse;
import com.mentormatrix.service.AdminService;
import com.mentormatrix.service.NotificationService;
import com.mentormatrix.service.StudentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@Tag(name = "Admin Controller", description = "Endpoints for administrators")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final StudentService studentService;
    private final NotificationService notificationService;

    private String getAuthenticatedEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<AdminResponse>> getProfile() {
        log.info("Fetching profile for admin");
        AdminResponse profile = adminService.getAdminByEmail(getAuthenticatedEmail());
        return ResponseEntity.ok(ApiResponse.success("Profile fetched successfully", profile));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<AdminResponse>> updateProfile(@Valid @RequestBody AdminProfileUpdateRequest updateRequest) {
        log.info("Updating profile for admin");
        AdminResponse updatedProfile = adminService.updateProfile(getAuthenticatedEmail(), updateRequest);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updatedProfile));
    }

    @PutMapping("/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivateAccount() {
        log.info("Deactivating admin account");
        adminService.deactivateAccount(getAuthenticatedEmail());
        return ResponseEntity.ok(ApiResponse.success("Account deactivated successfully"));
    }

    @DeleteMapping("/account")
    public ResponseEntity<ApiResponse<Void>> deleteAccount() {
        log.info("Deleting admin account");
        adminService.deleteAccount(getAuthenticatedEmail());
        return ResponseEntity.ok(ApiResponse.success("Account deleted successfully"));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard() {
        log.info("Fetching admin dashboard stats");
        DashboardResponse dashboard = adminService.getDashboard();
        return ResponseEntity.ok(ApiResponse.success("Dashboard stats fetched successfully", dashboard));
    }

    @GetMapping("/students")
    public ResponseEntity<ApiResponse<PagedResponse<StudentResponse>>> getStudents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("Fetching students");
        PagedResponse<StudentResponse> students = studentService.getAllStudents(page, size, "id", "asc");
        return ResponseEntity.ok(ApiResponse.success("Students fetched successfully", students));
    }

    @GetMapping("/students/search")
    public ResponseEntity<ApiResponse<PagedResponse<StudentResponse>>> searchStudents(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("Searching students");
        PagedResponse<StudentResponse> students = studentService.searchStudents(keyword, page, size, "id", "asc");
        return ResponseEntity.ok(ApiResponse.success("Students searched successfully", students));
    }

    @GetMapping("/students/{id}")
    public ResponseEntity<ApiResponse<StudentResponse>> getStudentById(@PathVariable Long id) {
        log.info("Fetching student by id");
        StudentResponse student = studentService.getStudentById(id);
        return ResponseEntity.ok(ApiResponse.success("Student fetched successfully", student));
    }

    @GetMapping("/admins")
    public ResponseEntity<ApiResponse<List<AdminResponse>>> getAdmins() {
        log.info("Fetching admins");
        List<AdminResponse> admins = adminService.getAllAdmins();
        return ResponseEntity.ok(ApiResponse.success("Admins fetched successfully", admins));
    }

    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotifications() {
        log.info("Fetching notifications for admin");
        List<NotificationResponse> notifications = notificationService.getNotifications(getAuthenticatedEmail());
        return ResponseEntity.ok(ApiResponse.success("Notifications fetched successfully", notifications));
    }

    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markNotificationAsRead(@PathVariable Long id) {
        log.info("Marking notification as read for admin");
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read"));
    }

    @PutMapping("/notifications/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllNotificationsAsRead() {
        log.info("Marking all notifications as read for admin");
        notificationService.markAllAsRead(getAuthenticatedEmail());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read"));
    }
}
