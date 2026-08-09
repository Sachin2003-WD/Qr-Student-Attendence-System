package com.mentormatrix.service;

import java.time.LocalDate;

public interface ReportExportService {
    byte[] generateAttendancePdfReport(LocalDate startDate, LocalDate endDate);
    byte[] generateAttendanceExcelReport(LocalDate startDate, LocalDate endDate);
    byte[] generateAttendanceCsvReport(LocalDate startDate, LocalDate endDate);
}
