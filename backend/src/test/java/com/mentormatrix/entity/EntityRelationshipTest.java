package com.mentormatrix.entity;

import com.mentormatrix.enums.*;
import com.mentormatrix.repository.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
@ActiveProfiles("test")
public class EntityRelationshipTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private BatchRepository batchRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private FacultyRepository facultyRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private AttendanceSessionRepository attendanceSessionRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Test
    @DisplayName("Test User Creation & Constraints")
    void testUserPersistence() {
        User user = User.builder()
                .name("John Admin")
                .email("admin@test.com")
                .phone("9998887770")
                .password("encoded_pass")
                .role(UserRole.ADMIN)
                .active(true)
                .deleted(false)
                .build();

        User savedUser = userRepository.save(user);
        assertNotNull(savedUser.getId());
        assertEquals("admin@test.com", savedUser.getEmail());
    }

    @Test
    @DisplayName("Test Duplicate Student Enrollment Constraint")
    void testDuplicateEnrollmentConstraint() {
        Department dept = departmentRepository.save(Department.builder().name("CSE").code("CS01").active(true).deleted(false).build());
        Course course = courseRepository.save(Course.builder().name("B.Tech CSE").code("BTCS").department(dept).active(true).deleted(false).build());
        Batch batch = batchRepository.save(Batch.builder().name("2022-2026").course(course).startYear(2022).endYear(2026).semester(5).active(true).deleted(false).build());

        User studentUser = userRepository.save(User.builder().name("Student 1").email("student1@test.com").phone("9876543210").password("pass").role(UserRole.STUDENT).active(true).deleted(false).build());
        Student student = studentRepository.save(Student.builder().user(studentUser).studentId("STU-101").department(dept).course(course).batch(batch).semester(5).section("A").status(StudentStatus.ACTIVE).active(true).deleted(false).build());

        Enrollment e1 = Enrollment.builder().student(student).batch(batch).enrollmentDate(LocalDate.now()).status(EnrollmentStatus.ACTIVE).active(true).deleted(false).build();
        enrollmentRepository.saveAndFlush(e1);

        Enrollment e2 = Enrollment.builder().student(student).batch(batch).enrollmentDate(LocalDate.now()).status(EnrollmentStatus.ACTIVE).active(true).deleted(false).build();

        assertThrows(DataIntegrityViolationException.class, () -> {
            enrollmentRepository.saveAndFlush(e2);
        });
    }

    @Test
    @DisplayName("Test Duplicate Attendance Per Session Constraint")
    void testDuplicateAttendanceConstraint() {
        Department dept = departmentRepository.save(Department.builder().name("ECE").code("EC01").active(true).deleted(false).build());
        Course course = courseRepository.save(Course.builder().name("B.Tech ECE").code("BTEC").department(dept).active(true).deleted(false).build());
        Batch batch = batchRepository.save(Batch.builder().name("2023-2027").course(course).startYear(2023).endYear(2027).semester(3).active(true).deleted(false).build());
        Subject subject = subjectRepository.save(Subject.builder().name("VLSI").code("EC301").course(course).semester(3).credits(4).active(true).deleted(false).build());

        User facUser = userRepository.save(User.builder().name("Prof Smith").email("smith@test.com").phone("9123456789").password("pass").role(UserRole.FACULTY).active(true).deleted(false).build());
        Faculty faculty = facultyRepository.save(Faculty.builder().user(facUser).facultyId("FAC-201").department(dept).status(FacultyStatus.ACTIVE).active(true).deleted(false).build());

        User stuUser = userRepository.save(User.builder().name("Student 2").email("student2@test.com").phone("9876543211").password("pass").role(UserRole.STUDENT).active(true).deleted(false).build());
        Student student = studentRepository.save(Student.builder().user(stuUser).studentId("STU-102").department(dept).course(course).batch(batch).semester(3).section("B").status(StudentStatus.ACTIVE).active(true).deleted(false).build());

        AttendanceSession session = attendanceSessionRepository.save(AttendanceSession.builder()
                .faculty(faculty)
                .batch(batch)
                .subject(subject)
                .sessionDate(LocalDate.now())
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(10, 0))
                .status(AttendanceSessionStatus.ACTIVE)
                .qrToken("TEST-TOKEN-123")
                .qrExpiresAt(LocalDateTime.now().plusSeconds(60))
                .active(true)
                .deleted(false)
                .build());

        Attendance a1 = Attendance.builder().student(student).attendanceSession(session).attendanceDate(LocalDate.now()).attendanceTime(LocalTime.now()).status(AttendanceStatus.PRESENT).active(true).deleted(false).build();
        attendanceRepository.saveAndFlush(a1);

        Attendance a2 = Attendance.builder().student(student).attendanceSession(session).attendanceDate(LocalDate.now()).attendanceTime(LocalTime.now()).status(AttendanceStatus.LATE).active(true).deleted(false).build();

        assertThrows(DataIntegrityViolationException.class, () -> {
            attendanceRepository.saveAndFlush(a2);
        });
    }
}
