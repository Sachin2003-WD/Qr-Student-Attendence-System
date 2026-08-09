package com.mentormatrix.dto.request;

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
