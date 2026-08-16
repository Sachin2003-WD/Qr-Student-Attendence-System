package com.mentormatrix.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:noreply@mentormatrix.com}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendOtpEmail(String toEmail, String otp) {
        log.info("===============================================================");
        log.info("📧 [OTP EMAIL DISPATCH] Recipient: {} | Code: {}", toEmail, otp);
        log.info("===============================================================");
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Your OTP Verification Code — Attendrix Smart Attendance");
            
            String htmlContent = "<div style=\"font-family: Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;\">"
                + "<div style=\"text-align: center; margin-bottom: 24px;\">"
                + "<h2 style=\"margin: 0; color: #0f172a; font-size: 22px; font-weight: 800;\">Attendrix</h2>"
                + "<p style=\"margin: 4px 0 0; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;\">Smart Attendance & Anti-Proxy Platform</p>"
                + "</div>"
                + "<div style=\"border-top: 1px solid #f1f5f9; padding-top: 20px;\">"
                + "<p style=\"color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 16px;\">Hello,</p>"
                + "<p style=\"color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 20px;\">You requested a password reset for your account. Please use the following 6-digit One-Time Password (OTP) to proceed:</p>"
                + "<div style=\"background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0;\">"
                + "<span style=\"font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0284c7;\">" + otp + "</span>"
                + "</div>"
                + "<p style=\"color: #64748b; font-size: 12px; line-height: 1.5; margin: 0 0 24px;\">⚠️ This code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>"
                + "<p style=\"color: #94a3b8; font-size: 11px; line-height: 1.5; margin: 0; border-top: 1px solid #f1f5f9; padding-top: 16px; text-align: center;\">If you did not request this email, you can safely ignore it.</p>"
                + "</div>"
                + "</div>";

            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("✓ [OTP EMAIL SENT] Successfully delivered to {}", toEmail);
        } catch (Exception e) {
            log.error("⚠️ [OTP EMAIL NOTICE] Live SMTP delivery encountered an issue: {}. (If SMTP credentials are not yet configured in application.properties, please set MAIL_USERNAME and MAIL_PASSWORD)", e.getMessage());
        }
    }

    @Async
    public void sendWelcomeEmail(String toEmail, String name, String role) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Welcome to Mentor Matrix!");
            helper.setText("<p>Hello " + name + ",</p><p>Welcome to Mentor Matrix! You are registered as a " + role + ".</p>", true);
            
            mailSender.send(message);
            log.info("Sent welcome email to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send welcome email to {}", toEmail, e);
        }
    }

    @Async
    public void sendPasswordChangedEmail(String toEmail, String name) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Password Changed Successfully");
            helper.setText("<p>Hello " + name + ",</p><p>Your password was changed successfully.</p>", true);
            
            mailSender.send(message);
            log.info("Sent password changed email to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send password changed email to {}", toEmail, e);
        }
    }
}
