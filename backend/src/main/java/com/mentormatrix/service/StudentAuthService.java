package com.mentormatrix.service;

import com.mentormatrix.dto.request.ChangePasswordRequest;
import com.mentormatrix.dto.request.ForgotPasswordRequest;
import com.mentormatrix.dto.request.LoginRequest;
import com.mentormatrix.dto.request.ResetPasswordRequest;
import com.mentormatrix.dto.request.StudentRegistrationRequest;
import com.mentormatrix.dto.response.AuthResponse;
import com.mentormatrix.entity.Department;
import com.mentormatrix.entity.Student;
import com.mentormatrix.entity.User;
import com.mentormatrix.enums.Gender;
import com.mentormatrix.enums.StudentStatus;
import com.mentormatrix.enums.UserRole;
import com.mentormatrix.exception.BadRequestException;
import com.mentormatrix.exception.DuplicateResourceException;
import com.mentormatrix.exception.ResourceNotFoundException;
import com.mentormatrix.exception.UnauthorizedException;
import com.mentormatrix.repository.DepartmentRepository;
import com.mentormatrix.repository.StudentRepository;
import com.mentormatrix.repository.UserRepository;
import com.mentormatrix.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;

@Service
@RequiredArgsConstructor
public class StudentAuthService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final RefreshTokenService refreshTokenService;

    @Transactional
    public AuthResponse register(StudentRegistrationRequest request) {
        if (request.getPassword() != null && request.getConfirmPassword() != null && !request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        if (request.getDob() != null && Period.between(request.getDob(), LocalDate.now()).getYears() < 16) {
            throw new BadRequestException("Student must be at least 16 years old");
        }

        if (userRepository.existsByEmailAndDeletedFalse(request.getEmail())) {
            throw new DuplicateResourceException("Email is already registered");
        }

        Department department = null;
        if (request.getDepartment() != null) {
            department = departmentRepository.findByCodeAndDeletedFalse(request.getDepartment())
                    .orElseGet(() -> departmentRepository.findByNameAndDeletedFalse(request.getDepartment()).orElse(null));
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.STUDENT)
                .active(true)
                .deleted(false)
                .build();

        User savedUser = userRepository.save(user);

        Student student = Student.builder()
                .user(savedUser)
                .studentId(request.getUsn() != null ? request.getUsn() : "STU" + savedUser.getId())
                .department(department)
                .semester(request.getSemester() != null ? request.getSemester() : 1)
                .section(request.getSection() != null ? request.getSection() : "A")
                .gender(request.getGender() != null ? request.getGender() : Gender.OTHER)
                .dob(request.getDob())
                .address(request.getAddress())
                .profileImage(request.getProfileImage())
                .interests(request.getInterests())
                .skills(request.getSkills())
                .status(StudentStatus.ACTIVE)
                .active(true)
                .deleted(false)
                .build();

        studentRepository.save(student);

        String token = jwtUtil.generateToken(user.getEmail(), "STUDENT", user.getName());
        String refreshToken = refreshTokenService.createRefreshToken(user.getEmail(), "STUDENT").getToken();

        return AuthResponse.builder()
                .token(token)
                .accessToken(token)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .name(user.getName())
                .role("STUDENT")
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailAndDeletedFalse(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new UnauthorizedException("Account is deactivated");
        }

        String token = jwtUtil.generateToken(user.getEmail(), "STUDENT", user.getName());
        String refreshToken = refreshTokenService.createRefreshToken(user.getEmail(), "STUDENT").getToken();

        return AuthResponse.builder()
                .token(token)
                .accessToken(token)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .name(user.getName())
                .role("STUDENT")
                .build();
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmailAndDeletedFalse(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));
    }

    public void resetPassword(ResetPasswordRequest request) {
        // password reset handling
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmailAndDeletedFalse(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public void logout(String email) {
        refreshTokenService.deleteByUserEmailAndRole(email, "STUDENT");
    }
}
