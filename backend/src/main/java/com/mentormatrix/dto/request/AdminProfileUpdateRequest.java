package com.mentormatrix.dto.request;

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
