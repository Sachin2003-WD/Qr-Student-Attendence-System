package com.mentormatrix.service;

import com.mentormatrix.dto.request.AdminProfileUpdateRequest;
import com.mentormatrix.dto.response.AdminResponse;
import com.mentormatrix.dto.response.DashboardResponse;
import com.mentormatrix.dto.response.ReportsAnalyticsResponse;

import java.util.List;

public interface AdminService {
    AdminResponse getAdminByEmail(String email);
    List<AdminResponse> getAllAdmins();
    AdminResponse updateProfile(String email, AdminProfileUpdateRequest request);
    DashboardResponse getDashboard();
    ReportsAnalyticsResponse getAnalytics();
    void deactivateAccount(String email);
    void deleteAccount(String email);
}
