package com.mentormatrix.dto.request;

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
public class QrScanRequest {

    @NotNull(message = "Session ID is required")
    private Long sessionId;

    @NotBlank(message = "QR Token is required")
    private String qrToken;

    private String deviceInfo;
}
