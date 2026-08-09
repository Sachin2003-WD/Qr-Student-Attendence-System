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
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Your OTP Code");
            helper.setText("<p>Your OTP code is: <strong>" + otp + "</strong></p>", true);
            
            mailSender.send(message);
            log.info("Sent OTP email to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}", toEmail, e);
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
