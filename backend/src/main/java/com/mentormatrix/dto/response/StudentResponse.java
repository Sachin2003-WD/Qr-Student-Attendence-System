package com.mentormatrix.dto.response;

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
    private Boolean active;
    private LocalDateTime createdAt;
}
