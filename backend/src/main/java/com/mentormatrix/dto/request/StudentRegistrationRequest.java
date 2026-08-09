package com.mentormatrix.dto.request;

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
