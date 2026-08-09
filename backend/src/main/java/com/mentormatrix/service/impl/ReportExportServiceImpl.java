package com.mentormatrix.service.impl;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.mentormatrix.entity.Attendance;
import com.mentormatrix.repository.AttendanceRepository;
import com.mentormatrix.service.ReportExportService;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportExportServiceImpl implements ReportExportService {

    private final AttendanceRepository attendanceRepository;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Override
    public byte[] generateAttendancePdfReport(LocalDate startDate, LocalDate endDate) {
        if (startDate == null) startDate = LocalDate.now().minusDays(30);
        if (endDate == null) endDate = LocalDate.now();

        List<Attendance> records = attendanceRepository.findByDateBetweenAndDeletedFalse(startDate, endDate);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);
            document.open();

            // Title
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.BLUE);
            Paragraph title = new Paragraph("Mentor Matrix - Attendance Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            Paragraph subTitle = new Paragraph("Date Range: " + startDate + " to " + endDate + " | Total Records: " + records.size(), FontFactory.getFont(FontFactory.HELVETICA, 10, Color.GRAY));
            subTitle.setAlignment(Element.ALIGN_CENTER);
            subTitle.setSpacingAfter(20);
            document.add(subTitle);

            // Table
            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1.5f, 2.5f, 1.5f, 2.0f, 2.0f, 1.5f});

            // Table Headers
            String[] headers = {"User ID / Email", "Name", "Role", "Date", "Marked At", "Status"};
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);

            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(header, headerFont));
                cell.setBackgroundColor(Color.DARK_GRAY);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setPadding(6);
                table.addCell(cell);
            }

            // Table Rows
            Font cellFont = FontFactory.getFont(FontFactory.HELVETICA, 9);
            for (Attendance a : records) {
                table.addCell(new Phrase(a.getUserEmail(), cellFont));
                table.addCell(new Phrase(a.getUserName(), cellFont));
                table.addCell(new Phrase(a.getUserRole(), cellFont));
                table.addCell(new Phrase(a.getDate().toString(), cellFont));
                table.addCell(new Phrase(a.getMarkedAt().format(DATE_FORMATTER), cellFont));
                table.addCell(new Phrase(a.getStatus().name(), cellFont));
            }

            document.add(table);
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF attendance report", e);
        }
    }

    @Override
    public byte[] generateAttendanceExcelReport(LocalDate startDate, LocalDate endDate) {
        if (startDate == null) startDate = LocalDate.now().minusDays(30);
        if (endDate == null) endDate = LocalDate.now();

        List<Attendance> records = attendanceRepository.findByDateBetweenAndDeletedFalse(startDate, endDate);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Attendance Report");

            // Header Row
            Row headerRow = sheet.createRow(0);
            String[] headers = {"ID", "User Email", "User Name", "Role", "Date", "Marked At", "Status", "IP Address", "Device"};

            CellStyle headerStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data Rows
            int rowNum = 1;
            for (Attendance a : records) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(a.getId() != null ? a.getId() : 0);
                row.createCell(1).setCellValue(a.getUserEmail());
                row.createCell(2).setCellValue(a.getUserName());
                row.createCell(3).setCellValue(a.getUserRole());
                row.createCell(4).setCellValue(a.getDate().toString());
                row.createCell(5).setCellValue(a.getMarkedAt() != null ? a.getMarkedAt().format(DATE_FORMATTER) : "");
                row.createCell(6).setCellValue(a.getStatus() != null ? a.getStatus().name() : "");
                row.createCell(7).setCellValue(a.getIpAddress() != null ? a.getIpAddress() : "");
                row.createCell(8).setCellValue(a.getDeviceInfo() != null ? a.getDeviceInfo() : "");
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Excel attendance report", e);
        }
    }

    @Override
    public byte[] generateAttendanceCsvReport(LocalDate startDate, LocalDate endDate) {
        if (startDate == null) startDate = LocalDate.now().minusDays(30);
        if (endDate == null) endDate = LocalDate.now();

        List<Attendance> records = attendanceRepository.findByDateBetweenAndDeletedFalse(startDate, endDate);

        StringBuilder sb = new StringBuilder();
        sb.append("ID,User Email,User Name,Role,Date,Marked At,Status,IP Address\n");

        for (Attendance a : records) {
            sb.append(a.getId()).append(",")
                    .append("\"").append(a.getUserEmail()).append("\",")
                    .append("\"").append(a.getUserName()).append("\",")
                    .append(a.getUserRole()).append(",")
                    .append(a.getDate()).append(",")
                    .append(a.getMarkedAt() != null ? a.getMarkedAt().format(DATE_FORMATTER) : "").append(",")
                    .append(a.getStatus()).append(",")
                    .append("\"").append(a.getIpAddress() != null ? a.getIpAddress() : "").append("\"\n");
        }

        return sb.toString().getBytes();
    }
}
