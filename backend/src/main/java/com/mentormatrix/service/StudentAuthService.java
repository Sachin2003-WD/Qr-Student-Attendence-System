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

        String cleanEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmailAndDeletedFalse(cleanEmail) || studentRepository.existsByEmailAndDeletedFalse(cleanEmail)) {
            throw new DuplicateResourceException("Email is already registered");
        }

        Department department = null;
        if (request.getDepartment() != null) {
            department = departmentRepository.findByCodeAndDeletedFalse(request.getDepartment())
                    .orElseGet(() -> departmentRepository.findByNameAndDeletedFalse(request.getDepartment())
                    .orElseGet(() -> departmentRepository.findAll().stream().findFirst().orElse(null)));
        }

        User user = User.builder()
                .name(request.getName())
                .email(cleanEmail)
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.STUDENT)
                .active(true)
                .deleted(false)
                .build();

        User savedUser = userRepository.save(user);

        Student student = Student.builder()
                .user(savedUser)
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .phone(savedUser.getPhone())
                .password(savedUser.getPassword())
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
        String rawInput = request.getEmail().trim();
        String cleanEmail = rawInput.toLowerCase();

        Student student = studentRepository.findByEmailAndDeletedFalse(cleanEmail).orElse(null);
        if (student == null) {
            student = studentRepository.findByStudentIdAndDeletedFalse(rawInput).orElse(null);
        }
        User user = userRepository.findByEmailAndDeletedFalse(cleanEmail).orElse(null);
        if (user == null && student != null && student.getUser() != null) {
            user = student.getUser();
        }

        if (student == null && user == null) {
            throw new UnauthorizedException("Invalid student email/USN or password");
        }

        String passwordHash = student != null && student.getPassword() != null ? student.getPassword() : (user != null ? user.getPassword() : null);
        String name = student != null && student.getName() != null ? student.getName() : (user != null ? user.getName() : "Student");
        String finalEmail = student != null && student.getEmail() != null ? student.getEmail() : (user != null ? user.getEmail() : cleanEmail);
        String usn = student != null ? student.getStudentId() : "";
        Boolean active = student != null && student.getActive() != null ? student.getActive() : (user != null ? user.getActive() : true);

        if (passwordHash == null || !passwordEncoder.matches(request.getPassword(), passwordHash)) {
            throw new UnauthorizedException("Invalid student email/USN or password");
        }

        if (!Boolean.TRUE.equals(active)) {
            throw new UnauthorizedException("Account is deactivated");
        }

        String token = jwtUtil.generateToken(finalEmail, "STUDENT", name);
        String refreshToken = refreshTokenService.createRefreshToken(finalEmail, "STUDENT").getToken();

        return AuthResponse.builder()
                .token(token)
                .accessToken(token)
                .refreshToken(refreshToken)
                .email(finalEmail)
                .name(name)
                .usn(usn)
                .role("STUDENT")
                .build();
    }

    private final OtpService otpService;

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        String cleanEmail = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmailAndDeletedFalse(cleanEmail).orElse(null);
        Student student = studentRepository.findByEmailAndDeletedFalse(cleanEmail).orElse(null);

        if (user == null && student == null) {
            throw new ResourceNotFoundException("No registered student found with email: " + cleanEmail);
        }

        String targetEmail = user != null ? user.getEmail() : (student != null ? student.getEmail() : cleanEmail);
        String otp = otpService.generateOtp(targetEmail);
        emailService.sendOtpEmail(targetEmail, otp);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        String cleanEmail = request.getEmail().trim().toLowerCase();

        if (!otpService.validateOtp(cleanEmail, request.getOtp().trim())) {
            throw new UnauthorizedException("Invalid or expired OTP code. Please check your email or request a new OTP.");
        }

        User user = userRepository.findByEmailAndDeletedFalse(cleanEmail).orElse(null);
        Student student = studentRepository.findByEmailAndDeletedFalse(cleanEmail).orElse(null);

        if (user == null && student == null) {
            throw new ResourceNotFoundException("Student not found for email: " + cleanEmail);
        }

        String encodedPassword = passwordEncoder.encode(request.getNewPassword());
        if (user != null) {
            user.setPassword(encodedPassword);
            userRepository.save(user);
        }
        if (student != null) {
            student.setPassword(encodedPassword);
            studentRepository.save(student);
        }

        otpService.clearOtp(cleanEmail);
        String studentName = user != null ? user.getName() : (student != null ? student.getName() : "Student");
        emailService.sendPasswordChangedEmail(cleanEmail, studentName);
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
