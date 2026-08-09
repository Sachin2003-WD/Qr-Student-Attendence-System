package com.mentormatrix.service;

import com.mentormatrix.dto.request.StudentProfileUpdateRequest;
import com.mentormatrix.response.PagedResponse;
import com.mentormatrix.dto.response.StudentResponse;
import org.springframework.web.multipart.MultipartFile;

public interface StudentService {
    StudentResponse getStudentById(Long id);
    StudentResponse getStudentByEmail(String email);
    PagedResponse<StudentResponse> getAllStudents(int page, int size, String sortBy, String sortDir);
    PagedResponse<StudentResponse> searchStudents(String keyword, int page, int size, String sortBy, String sortDir);
    PagedResponse<StudentResponse> getStudentsByDepartment(String department, int page, int size, String sortBy, String sortDir);
    StudentResponse updateProfile(String email, StudentProfileUpdateRequest request);
    void uploadProfileImage(String email, MultipartFile file);
    void deactivateAccount(String email);
    void deleteAccount(String email);
}
