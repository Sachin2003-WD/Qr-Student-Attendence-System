package com.mentormatrix.dto.request;

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
