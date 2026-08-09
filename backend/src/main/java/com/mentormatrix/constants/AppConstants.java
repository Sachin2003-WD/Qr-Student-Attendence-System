package com.mentormatrix.constants;

public final class AppConstants {

    private AppConstants() {
        throw new UnsupportedOperationException("Cannot instantiate utility class");
    }

    // Admin Limits
    public static final int MAX_ADMIN_COUNT = 10;

    // Pagination Defaults
    public static final String DEFAULT_PAGE_NUMBER = "0";
    public static final String DEFAULT_PAGE_SIZE = "10";
    public static final String DEFAULT_SORT_BY = "id";
    public static final String DEFAULT_SORT_DIR = "asc";

    // Validation
    public static final int MIN_PASSWORD_LENGTH = 8;
    public static final int MAX_PASSWORD_LENGTH = 100;
    public static final int MIN_AGE = 16;
    public static final long MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
    public static final int MIN_RATING = 1;
    public static final int MAX_RATING = 5;
    public static final int MIN_SEMESTER = 1;
    public static final int MAX_SEMESTER = 8;

    // Regex Patterns
    public static final String EMAIL_REGEX = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
    public static final String PHONE_REGEX = "^[6-9]\\d{9}$";
    public static final String PASSWORD_REGEX = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$";

    // Messages
    public static final String MAX_ADMIN_LIMIT_MESSAGE = "Maximum Admin Limit Reached. Only 10 administrators are allowed.";
    public static final String REGISTRATION_SUCCESS = "Registration successful";
    public static final String LOGIN_SUCCESS = "Login successful";
    public static final String LOGOUT_SUCCESS = "Logout successful";
    public static final String PASSWORD_CHANGED = "Password changed successfully";
    public static final String PASSWORD_RESET_SUCCESS = "Password has been reset successfully";
    public static final String OTP_SENT = "OTP has been sent to your registered email";
    public static final String PROFILE_UPDATED = "Profile updated successfully";
    public static final String PROFILE_DELETED = "Account deleted successfully";
    public static final String PROFILE_DEACTIVATED = "Account deactivated successfully";
    public static final String MENTOR_ASSIGNED = "Mentor assigned successfully";
    public static final String SESSION_REQUESTED = "Session requested successfully";
    public static final String SESSION_APPROVED = "Session approved successfully";
    public static final String SESSION_REJECTED = "Session rejected successfully";
    public static final String SESSION_CANCELLED = "Session cancelled successfully";
    public static final String SESSION_RESCHEDULED = "Session rescheduled successfully";
    public static final String SESSION_COMPLETED = "Session marked as completed";
    public static final String FEEDBACK_SUBMITTED = "Feedback submitted successfully";
    public static final String NOTIFICATION_READ = "Notification marked as read";

    // File Upload
    public static final String UPLOAD_DIR = "uploads/profile-images";
    public static final String[] ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/jpg", "image/webp"};

    // JWT
    public static final String TOKEN_PREFIX = "Bearer ";
    public static final String AUTHORIZATION_HEADER = "Authorization";

    // Notification Types
    public static final String NOTIF_SESSION_APPROVED = "Session Approved";
    public static final String NOTIF_SESSION_CANCELLED = "Session Cancelled";
    public static final String NOTIF_FEEDBACK_SUBMITTED = "Feedback Submitted";
    public static final String NOTIF_MENTOR_ASSIGNED = "Mentor Assigned";
    public static final String NOTIF_PASSWORD_CHANGED = "Password Changed";
    public static final String NOTIF_NEW_REGISTRATION = "New Registration";
}
