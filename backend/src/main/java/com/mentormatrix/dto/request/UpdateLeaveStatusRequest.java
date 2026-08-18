package com.mentormatrix.dto.request;

import com.mentormatrix.enums.LeaveStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateLeaveStatusRequest {

    @NotNull(message = "Status is required")
    private LeaveStatus status;

    private String remarks;
}
