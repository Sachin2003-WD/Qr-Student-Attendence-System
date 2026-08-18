package com.mentormatrix.service;

import com.mentormatrix.dto.request.CreateLeaveRequest;
import com.mentormatrix.dto.request.UpdateLeaveStatusRequest;
import com.mentormatrix.dto.response.LeaveResponse;
import com.mentormatrix.enums.LeaveStatus;

import java.util.List;

public interface LeaveService {
    LeaveResponse submitLeaveRequest(String studentEmail, CreateLeaveRequest request);
    List<LeaveResponse> getMyLeaveRequests(String studentEmail);
    List<LeaveResponse> getAllLeaveRequests(LeaveStatus status);
    LeaveResponse updateLeaveStatus(Long id, UpdateLeaveStatusRequest request, String reviewerEmail);
}
