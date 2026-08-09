package com.mentormatrix.security;

import com.mentormatrix.entity.Admin;
import com.mentormatrix.entity.Student;
import com.mentormatrix.repository.AdminRepository;
import com.mentormatrix.repository.StudentRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final AdminRepository adminRepository;
    private final StudentRepository studentRepository;

    public CustomUserDetailsService(AdminRepository adminRepository, StudentRepository studentRepository) {
        this.adminRepository = adminRepository;
        this.studentRepository = studentRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Optional<Admin> admin = adminRepository.findByEmailAndDeletedFalse(email);
        if (admin.isPresent()) {
            return CustomUserDetails.fromAdmin(admin.get());
        }

        Optional<Student> student = studentRepository.findByEmailAndDeletedFalse(email);
        if (student.isPresent()) {
            return CustomUserDetails.fromStudent(student.get());
        }

        throw new UsernameNotFoundException("User not found with email: " + email);
    }

    public UserDetails loadUserByEmailAndRole(String email, String role) throws UsernameNotFoundException {
        if ("ADMIN".equalsIgnoreCase(role)) {
            Admin admin = adminRepository.findByEmailAndDeletedFalse(email)
                    .orElseThrow(() -> new UsernameNotFoundException("Admin not found with email: " + email));
            return CustomUserDetails.fromAdmin(admin);
        } else if ("STUDENT".equalsIgnoreCase(role)) {
            Student student = studentRepository.findByEmailAndDeletedFalse(email)
                    .orElseThrow(() -> new UsernameNotFoundException("Student not found with email: " + email));
            return CustomUserDetails.fromStudent(student);
        } else {
            throw new UsernameNotFoundException("Invalid role provided: " + role);
        }
    }
}
