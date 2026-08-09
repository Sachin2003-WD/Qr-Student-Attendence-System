package com.mentormatrix.service.impl;

import com.mentormatrix.dto.request.AdminProfileUpdateRequest;
import com.mentormatrix.dto.response.AdminResponse;
import com.mentormatrix.dto.response.DashboardResponse;
import com.mentormatrix.entity.Admin;
import com.mentormatrix.enums.AttendanceStatus;
import com.mentormatrix.exception.ResourceNotFoundException;
import com.mentormatrix.repository.AdminRepository;
import com.mentormatrix.repository.AttendanceRepository;
import com.mentormatrix.repository.StudentRepository;
import com.mentormatrix.service.AdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class AdminServiceImpl implements AdminService {

    private final AdminRepository adminRepository;
    private final StudentRepository studentRepository;
    private final AttendanceRepository attendanceRepository;
    private final ModelMapper modelMapper;

    @Override
    public AdminResponse getAdminByEmail(String email) {
        Admin admin = adminRepository.findByEmailAndDeletedFalse(email)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with email: " + email));
        return modelMapper.map(admin, AdminResponse.class);
    }

    @Override
    public List<AdminResponse> getAllAdmins() {
        return adminRepository.findAllByDeletedFalse().stream()
                .map(admin -> modelMapper.map(admin, AdminResponse.class))
                .collect(Collectors.toList());
    }

    @Override
    public AdminResponse updateProfile(String email, AdminProfileUpdateRequest request) {
        Admin admin = adminRepository.findByEmailAndDeletedFalse(email)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with email: " + email));
        
        if (request.getName() != null) {
            admin.setName(request.getName());
        }
        if (request.getPhone() != null) {
            admin.setPhone(request.getPhone());
        }
        
        Admin updatedAdmin = adminRepository.save(admin);
        return modelMapper.map(updatedAdmin, AdminResponse.class);
    }

    @Override
    public DashboardResponse getDashboard() {
        long totalStudents = studentRepository.countByDeletedFalse();
        long totalAdmins = adminRepository.countByDeletedFalse();
        LocalDate today = LocalDate.now();

        long presentCount = attendanceRepository.countByDateAndStatus(today, AttendanceStatus.PRESENT);
        long absentCount = attendanceRepository.countByDateAndStatus(today, AttendanceStatus.ABSENT);
        long lateCount = attendanceRepository.countByDateAndStatus(today, AttendanceStatus.LATE);
        long todayTotal = presentCount + absentCount + lateCount;
        
        Map<String, Long> departmentStatistics = new HashMap<>();
        List<String> distinctDepts = studentRepository.findDistinctDepartments();
        for (String dept : distinctDepts) {
            if (dept != null) {
                departmentStatistics.put(dept, studentRepository.countByDepartmentAndDeletedFalse(dept));
            }
        }
        
        return DashboardResponse.builder()
                .totalStudents(totalStudents)
                .totalFaculty(0)
                .totalAdmins(totalAdmins)
                .totalDepartments(distinctDepts.size())
                .todayAttendanceCount(todayTotal)
                .presentCount(presentCount)
                .absentCount(absentCount)
                .lateCount(lateCount)
                .departmentStatistics(departmentStatistics)
                .build();
    }

    @Override
    public void deactivateAccount(String email) {
        Admin admin = adminRepository.findByEmailAndDeletedFalse(email)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with email: " + email));
        admin.setActive(false);
        adminRepository.save(admin);
    }

    @Override
    public void deleteAccount(String email) {
        Admin admin = adminRepository.findByEmailAndDeletedFalse(email)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with email: " + email));
        admin.setDeleted(true);
        admin.setActive(false);
        adminRepository.save(admin);
    }
}
