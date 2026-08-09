import os

base_dir = r"C:\Users\sck05\Documents\MavenProjects\mentor-matrix\mentor-connect-ai-51\backend\src\main\java\com\mentormatrix"

directories = [
    "dto/request",
    "dto/response",
    "response",
    "config",
    "validation"
]

for d in directories:
    os.makedirs(os.path.join(base_dir, d.replace('/', '\\')), exist_ok=True)

files = {}

# ----------------- VALIDATORS -----------------
files[r"validation\ValidPassword.java"] = """package com.mentormatrix.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Documented
@Constraint(validatedBy = PasswordValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidPassword {
    String message() default "Password must contain at least 8 characters, one uppercase, one lowercase, one digit, and one special character";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
"""

files[r"validation\PasswordValidator.java"] = """package com.mentormatrix.validation;

import com.mentormatrix.constants.AppConstants;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.regex.Pattern;

public class PasswordValidator implements ConstraintValidator<ValidPassword, String> {

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        if (password == null) {
            return false;
        }
        return Pattern.matches(AppConstants.PASSWORD_REGEX, password);
    }
}
"""

files[r"validation\ValidPhone.java"] = """package com.mentormatrix.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Documented
@Constraint(validatedBy = PhoneValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidPhone {
    String message() default "Phone number must be a valid 10-digit Indian mobile number";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
"""

files[r"validation\PhoneValidator.java"] = """package com.mentormatrix.validation;

import com.mentormatrix.constants.AppConstants;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.regex.Pattern;

public class PhoneValidator implements ConstraintValidator<ValidPhone, String> {

    @Override
    public boolean isValid(String phone, ConstraintValidatorContext context) {
        if (phone == null) {
            return false;
        }
        return Pattern.matches(AppConstants.PHONE_REGEX, phone);
    }
}
"""

# ----------------- CONFIG -----------------
files[r"config\ModelMapperConfig.java"] = """package com.mentormatrix.config;

import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ModelMapperConfig {

    @Bean
    public ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper();
        modelMapper.getConfiguration().setMatchingStrategy(MatchingStrategies.STRICT);
        return modelMapper;
    }
}
"""

# ----------------- RESPONSE -----------------
files[r"response\PagedResponse.java"] = """package com.mentormatrix.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PagedResponse<T> {
    private List<T> content;
    private int pageNumber;
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private boolean last;
}
"""

# ----------------- REQUEST DTOs -----------------
files[r"dto\request\StudentRegistrationRequest.java"] = """package com.mentormatrix.dto.request;

import com.mentormatrix.enums.Gender;
import com.mentormatrix.validation.ValidPassword;
import com.mentormatrix.validation.ValidPhone;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentRegistrationRequest {
    @NotBlank
    private String name;

    @NotBlank
    private String usn;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @ValidPhone
    private String phone;

    @NotBlank
    @ValidPassword
    private String password;

    @NotBlank
    private String confirmPassword;

    @NotBlank
    private String department;

    @NotNull
    @Min(1)
    @Max(8)
    private Integer semester;

    @NotBlank
    private String section;

    @NotNull
    private Gender gender;

    @NotNull
    @Past
    private LocalDate dob;

    @NotBlank
    private String address;

    private String profileImage;
    private String interests;
    private String skills;
}
"""

files[r"dto\request\MentorRegistrationRequest.java"] = """package com.mentormatrix.dto.request;

import com.mentormatrix.validation.ValidPassword;
import com.mentormatrix.validation.ValidPhone;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MentorRegistrationRequest {
    @NotBlank
    private String employeeId;

    @NotBlank
    private String name;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @ValidPhone
    private String phone;

    @NotBlank
    @ValidPassword
    private String password;

    @NotBlank
    private String department;

    @NotBlank
    private String designation;

    @NotNull
    @Min(0)
    private Integer experience;

    @NotBlank
    private String qualification;

    @NotBlank
    private String specialization;

    private String skills;
    private String profileImage;
}
"""

files[r"dto\request\AdminRegistrationRequest.java"] = """package com.mentormatrix.dto.request;

import com.mentormatrix.validation.ValidPassword;
import com.mentormatrix.validation.ValidPhone;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminRegistrationRequest {
    @NotBlank
    private String name;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @ValidPhone
    private String phone;

    @NotBlank
    @ValidPassword
    private String password;
}
"""

files[r"dto\request\LoginRequest.java"] = """package com.mentormatrix.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String password;

    private boolean rememberMe;
}
"""

files[r"dto\request\ForgotPasswordRequest.java"] = """package com.mentormatrix.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForgotPasswordRequest {
    @NotBlank
    @Email
    private String email;
}
"""

files[r"dto\request\ResetPasswordRequest.java"] = """package com.mentormatrix.dto.request;

import com.mentormatrix.validation.ValidPassword;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResetPasswordRequest {
    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String otp;

    @NotBlank
    @ValidPassword
    private String newPassword;

    @NotBlank
    private String confirmPassword;
}
"""

files[r"dto\request\ChangePasswordRequest.java"] = """package com.mentormatrix.dto.request;

import com.mentormatrix.validation.ValidPassword;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChangePasswordRequest {
    @NotBlank
    private String currentPassword;

    @NotBlank
    @ValidPassword
    private String newPassword;

    @NotBlank
    private String confirmPassword;
}
"""

files[r"dto\request\SessionRequest.java"] = """package com.mentormatrix.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionRequest {
    @NotNull
    private Long mentorId;

    @NotNull
    @Future
    private LocalDateTime startTime;

    @NotNull
    @Future
    private LocalDateTime endTime;

    @NotBlank
    private String purpose;
}
"""

files[r"dto\request\RescheduleRequest.java"] = """package com.mentormatrix.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RescheduleRequest {
    @NotNull
    @Future
    private LocalDateTime newStartTime;

    @NotNull
    @Future
    private LocalDateTime newEndTime;

    @NotBlank
    private String reason;
}
"""

files[r"dto\request\FeedbackRequest.java"] = """package com.mentormatrix.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackRequest {
    @NotNull
    private Long sessionId;

    @NotNull
    @Min(1)
    @Max(5)
    private Integer rating;

    private String comment;
}
"""

files[r"dto\request\StudentProfileUpdateRequest.java"] = """package com.mentormatrix.dto.request;

import com.mentormatrix.validation.ValidPhone;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfileUpdateRequest {
    private String name;
    
    @ValidPhone
    private String phone;
    
    private String department;
    
    @Min(1)
    @Max(8)
    private Integer semester;
    
    private String section;
    private String address;
    private String interests;
    private String skills;
}
"""

files[r"dto\request\MentorProfileUpdateRequest.java"] = """package com.mentormatrix.dto.request;

import com.mentormatrix.validation.ValidPhone;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MentorProfileUpdateRequest {
    private String name;
    
    @ValidPhone
    private String phone;
    
    private String department;
    private String designation;
    
    @Min(0)
    private Integer experience;
    
    private String qualification;
    private String specialization;
    private String skills;
}
"""

files[r"dto\request\AdminProfileUpdateRequest.java"] = """package com.mentormatrix.dto.request;

import com.mentormatrix.validation.ValidPhone;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminProfileUpdateRequest {
    private String name;
    
    @ValidPhone
    private String phone;
}
"""

files[r"dto\request\MentorAssignmentRequest.java"] = """package com.mentormatrix.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MentorAssignmentRequest {
    @NotNull
    private Long studentId;

    @NotNull
    private Long mentorId;
}
"""

files[r"dto\request\AvailabilityRequest.java"] = """package com.mentormatrix.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityRequest {
    @NotNull
    @Future
    private LocalDateTime startTime;

    @NotNull
    @Future
    private LocalDateTime endTime;
}
"""

files[r"dto\request\RejectSessionRequest.java"] = """package com.mentormatrix.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RejectSessionRequest {
    @NotBlank
    private String reason;
}
"""

# ----------------- RESPONSE DTOs -----------------
files[r"dto\response\AuthResponse.java"] = """package com.mentormatrix.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    @Builder.Default
    private String tokenType = "Bearer";
    private String email;
    private String name;
    private String role;
    private Long expiresIn;
}
"""

files[r"dto\response\StudentResponse.java"] = """package com.mentormatrix.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentResponse {
    private Long id;
    private String usn;
    private String name;
    private String email;
    private String phone;
    private String department;
    private Integer semester;
    private String section;
    private String gender;
    private String dob;
    private String address;
    private String profileImage;
    private String interests;
    private String skills;
    private Long mentorId;
    private String mentorName;
    private Boolean active;
    private LocalDateTime createdAt;
}
"""

files[r"dto\response\MentorResponse.java"] = """package com.mentormatrix.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MentorResponse {
    private Long id;
    private String employeeId;
    private String name;
    private String email;
    private String phone;
    private String department;
    private String designation;
    private Integer experience;
    private String qualification;
    private String specialization;
    private String skills;
    private String profileImage;
    private Boolean active;
    private LocalDateTime createdAt;
    private Double averageRating;
    private Integer totalStudents;
}
"""

files[r"dto\response\AdminResponse.java"] = """package com.mentormatrix.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private Boolean active;
    private LocalDateTime createdAt;
}
"""

files[r"dto\response\SessionResponse.java"] = """package com.mentormatrix.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private String studentUsn;
    private Long mentorId;
    private String mentorName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    private String purpose;
    private String rejectionReason;
    private String rescheduleReason;
    private LocalDateTime createdAt;
    private boolean hasFeedback;
}
"""

files[r"dto\response\FeedbackResponse.java"] = """package com.mentormatrix.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackResponse {
    private Long id;
    private Long sessionId;
    private Long studentId;
    private String studentName;
    private Long mentorId;
    private String mentorName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
"""

files[r"dto\response\NotificationResponse.java"] = """package com.mentormatrix.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private String title;
    private String message;
    private Boolean read;
    private String recipientRole;
    private LocalDateTime createdAt;
}
"""

files[r"dto\response\MentorAvailabilityResponse.java"] = """package com.mentormatrix.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MentorAvailabilityResponse {
    private Long id;
    private Long mentorId;
    private String mentorName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Boolean booked;
}
"""

files[r"dto\response\DashboardResponse.java"] = """package com.mentormatrix.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private long totalStudents;
    private long totalMentors;
    private long totalAdmins;
    private long totalSessions;
    private long completedSessions;
    private long cancelledSessions;
    private Double averageRating;
    private Map<String, Long> monthlySessions;
    private Map<String, Long> departmentStatistics;
}
"""

for filepath, content in files.items():
    full_path = os.path.join(base_dir, filepath)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Files generated successfully!")
