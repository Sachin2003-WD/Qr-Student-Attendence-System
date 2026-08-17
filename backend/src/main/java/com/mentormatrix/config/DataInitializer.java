package com.mentormatrix.config;

import com.mentormatrix.entity.*;
import com.mentormatrix.enums.Gender;
import com.mentormatrix.enums.StudentStatus;
import com.mentormatrix.enums.UserRole;
import com.mentormatrix.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final JdbcTemplate jdbcTemplate;
    private final DepartmentRepository departmentRepository;
    private final CourseRepository courseRepository;
    private final BatchRepository batchRepository;
    private final UserRepository userRepository;
    private final AdminRepository adminRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(JdbcTemplate jdbcTemplate,
                           DepartmentRepository departmentRepository,
                           CourseRepository courseRepository,
                           BatchRepository batchRepository,
                           UserRepository userRepository,
                           AdminRepository adminRepository,
                           StudentRepository studentRepository,
                           PasswordEncoder passwordEncoder) {
        this.jdbcTemplate = jdbcTemplate;
        this.departmentRepository = departmentRepository;
        this.courseRepository = courseRepository;
        this.batchRepository = batchRepository;
        this.userRepository = userRepository;
        this.adminRepository = adminRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        fixDatabaseSchema();
        cleanExistingUserData();
        seedDepartments();
    }

    private void cleanExistingUserData() {
        try {
            log.info("Cleaning all existing student, admin, and attendance records from database...");
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 0");
            try { jdbcTemplate.execute("DELETE FROM attendance_records"); } catch (Exception ignored) {}
            try { jdbcTemplate.execute("DELETE FROM attendance"); } catch (Exception ignored) {}
            try { jdbcTemplate.execute("DELETE FROM lab_attendance"); } catch (Exception ignored) {}
            try { jdbcTemplate.execute("DELETE FROM refresh_tokens"); } catch (Exception ignored) {}
            try { jdbcTemplate.execute("DELETE FROM otps"); } catch (Exception ignored) {}
            try { jdbcTemplate.execute("DELETE FROM notifications"); } catch (Exception ignored) {}
            try { jdbcTemplate.execute("DELETE FROM students"); } catch (Exception ignored) {}
            try { jdbcTemplate.execute("DELETE FROM admins"); } catch (Exception ignored) {}
            try { jdbcTemplate.execute("DELETE FROM users"); } catch (Exception ignored) {}
            try { jdbcTemplate.execute("DELETE FROM batches"); } catch (Exception ignored) {}
            try { jdbcTemplate.execute("DELETE FROM courses"); } catch (Exception ignored) {}
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1");
            log.info("Database user and student/admin tables successfully cleaned.");
        } catch (Exception e) {
            log.warn("Database cleanup notice: {}", e.getMessage());
            try {
                jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1");
            } catch (Exception ignored) {}
        }
    }

    private void fixDatabaseSchema() {
        try {
            jdbcTemplate.execute("ALTER TABLE students MODIFY COLUMN usn VARCHAR(255) NULL");
            log.info("Ensured legacy 'usn' column on 'students' is nullable.");
        } catch (Exception e) {
            log.debug("Schema fix for students usn column: {}", e.getMessage());
        }

        try {
            jdbcTemplate.execute("ALTER TABLE students MODIFY COLUMN department VARCHAR(255) NULL");
            log.info("Ensured legacy 'department' column on 'students' is nullable.");
        } catch (Exception e) {
            log.debug("Schema fix for students department column: {}", e.getMessage());
        }

        try {
            jdbcTemplate.execute("ALTER TABLE students ADD COLUMN IF NOT EXISTS name VARCHAR(100)");
            jdbcTemplate.execute("ALTER TABLE students ADD COLUMN IF NOT EXISTS email VARCHAR(100)");
            jdbcTemplate.execute("ALTER TABLE students ADD COLUMN IF NOT EXISTS phone VARCHAR(20)");
            jdbcTemplate.execute("ALTER TABLE students ADD COLUMN IF NOT EXISTS password VARCHAR(255)");
        } catch (Exception e) {
            log.debug("Schema fix for students columns: {}", e.getMessage());
        }

        try {
            jdbcTemplate.execute("ALTER TABLE admins ADD COLUMN IF NOT EXISTS name VARCHAR(100)");
            jdbcTemplate.execute("ALTER TABLE admins ADD COLUMN IF NOT EXISTS email VARCHAR(100)");
            jdbcTemplate.execute("ALTER TABLE admins ADD COLUMN IF NOT EXISTS phone VARCHAR(20)");
            jdbcTemplate.execute("ALTER TABLE admins ADD COLUMN IF NOT EXISTS password VARCHAR(255)");
        } catch (Exception e) {
            log.debug("Schema fix for admins columns: {}", e.getMessage());
        }
    }

    private void seedDepartments() {
        if (departmentRepository.count() == 0) {
            log.info("Seeding default departments...");
            createDept("Computer Science", "CS", "Department of Computer Science & Engineering");
            createDept("Information Technology", "IT", "Department of Information Technology");
            createDept("Electronics & Comm", "ECE", "Department of Electronics & Communication");
            createDept("Mechanical Eng", "ME", "Department of Mechanical Engineering");
            createDept("AIML", "AIML", "Department of Artificial Intelligence & Machine Learning");
            createDept("Civil Eng", "CIVIL", "Department of Civil Engineering");
        }
    }

    private void createDept(String name, String code, String desc) {
        Department dept = Department.builder()
                .name(name)
                .code(code)
                .description(desc)
                .active(true)
                .deleted(false)
                .build();
        departmentRepository.save(dept);
    }

    private void seedCoursesAndBatches() {
        if (courseRepository.count() == 0) {
            Department csDept = departmentRepository.findByCodeAndDeletedFalse("CS").orElse(null);
            if (csDept != null) {
                Course course = Course.builder()
                        .name("B.Tech Computer Science")
                        .code("CSE-BTECH")
                        .department(csDept)
                        .duration("4 Years")
                        .description("Bachelor of Technology in Computer Science")
                        .active(true)
                        .deleted(false)
                        .build();
                course = courseRepository.save(course);

                if (batchRepository.count() == 0) {
                    Batch batch = Batch.builder()
                            .name("CS-2026-Batch-A")
                            .batchCode("CS-2026-A")
                            .department(csDept)
                            .departmentName(csDept.getName())
                            .departmentCode(csDept.getCode())
                            .course(course)
                            .startYear(2022)
                            .endYear(2026)
                            .semester(6)
                            .section("A")
                            .branch("Main Campus")
                            .subjectName("Data Structures & Algorithms")
                            .trainerName("Faculty Lead")
                            .classTiming("09:00 AM")
                            .startDate(LocalDate.now())
                            .active(true)
                            .deleted(false)
                            .build();
                    batchRepository.save(batch);
                }
            }
        }
    }

    private void seedDefaultAdmin() {
        try {
            String email = "admin@college.edu";
            String phone = "9876543210";
            String rawPass = "Password@123";
            String encodedPass = passwordEncoder.encode(rawPass);

            User user = userRepository.findByEmailAndDeletedFalse(email)
                    .orElseGet(() -> userRepository.findByPhoneAndDeletedFalse(phone).orElse(null));

            if (user == null) {
                user = User.builder()
                        .name("System Administrator")
                        .email(email)
                        .phone(phone)
                        .password(encodedPass)
                        .role(UserRole.ADMIN)
                        .active(true)
                        .deleted(false)
                        .build();
                user = userRepository.save(user);
            } else {
                user.setPassword(encodedPass);
                user = userRepository.save(user);
            }

            if (!adminRepository.existsByEmailAndDeletedFalse(user.getEmail())) {
                Admin admin = Admin.builder()
                        .user(user)
                        .name(user.getName())
                        .email(user.getEmail())
                        .phone(user.getPhone())
                        .password(user.getPassword())
                        .active(true)
                        .deleted(false)
                        .build();
                adminRepository.save(admin);
                log.info("Default Admin created: {} / {}", user.getEmail(), rawPass);
            }
        } catch (Exception e) {
            log.warn("Default Admin seeding skipped: {}", e.getMessage());
        }
    }

    private void seedDefaultStudent() {
        try {
            String email = "student@college.edu";
            String phone = "9876543211";
            String rawPass = "Password@123";
            String encodedPass = passwordEncoder.encode(rawPass);

            Department csDept = departmentRepository.findByCodeAndDeletedFalse("CS").orElse(null);
            Batch batch = batchRepository.findAll().stream().findFirst().orElse(null);

            User user = userRepository.findByEmailAndDeletedFalse(email)
                    .orElseGet(() -> userRepository.findByPhoneAndDeletedFalse(phone).orElse(null));

            if (user == null) {
                user = User.builder()
                        .name("Demo Student")
                        .email(email)
                        .phone(phone)
                        .password(encodedPass)
                        .role(UserRole.STUDENT)
                        .active(true)
                        .deleted(false)
                        .build();
                user = userRepository.save(user);
            } else {
                user.setPassword(encodedPass);
                user = userRepository.save(user);
            }

            if (!studentRepository.existsByEmailAndDeletedFalse(user.getEmail())) {
                Student student = Student.builder()
                        .user(user)
                        .studentId("1RA21CS001")
                        .department(csDept)
                        .batch(batch)
                        .semester(6)
                        .section("A")
                        .gender(Gender.MALE)
                        .dob(LocalDate.of(2003, 5, 15))
                        .address("Campus Residence, College Road")
                        .status(StudentStatus.ACTIVE)
                        .name(user.getName())
                        .email(user.getEmail())
                        .phone(user.getPhone())
                        .password(user.getPassword())
                        .active(true)
                        .deleted(false)
                        .build();
                studentRepository.save(student);
                log.info("Default Student created: {} / {}", user.getEmail(), rawPass);
            }
        } catch (Exception e) {
            log.warn("Default Student seeding skipped: {}", e.getMessage());
        }
    }
}
