package com.mentormatrix.service.impl;

import com.mentormatrix.dto.request.StudentProfileUpdateRequest;
import com.mentormatrix.dto.response.StudentResponse;
import com.mentormatrix.entity.Department;
import com.mentormatrix.entity.Student;
import com.mentormatrix.exception.ResourceNotFoundException;
import com.mentormatrix.repository.DepartmentRepository;
import com.mentormatrix.repository.StudentRepository;
import com.mentormatrix.response.PagedResponse;
import com.mentormatrix.service.StudentService;
import com.mentormatrix.util.FileUploadUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final DepartmentRepository departmentRepository;
    private final FileUploadUtil fileUploadUtil;
    private final ModelMapper modelMapper;

    @Override
    public StudentResponse getStudentByEmail(String email) {
        Student student = studentRepository.findByEmailAndDeletedFalse(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with email: " + email));
        return mapToResponse(student);
    }

    @Override
    public StudentResponse getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .filter(s -> !s.getDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
        return mapToResponse(student);
    }

    @Override
    public PagedResponse<StudentResponse> getAllStudents(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Student> students = studentRepository.findAllByDeletedFalse(pageable);
        
        List<StudentResponse> content = students.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PagedResponse.<StudentResponse>builder()
                .content(content)
                .pageNumber(students.getNumber())
                .pageSize(students.getSize())
                .totalElements(students.getTotalElements())
                .totalPages(students.getTotalPages())
                .last(students.isLast())
                .build();
    }

    @Override
    public PagedResponse<StudentResponse> searchStudents(String keyword, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Student> students = studentRepository.searchStudents(keyword, pageable);

        List<StudentResponse> content = students.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PagedResponse.<StudentResponse>builder()
                .content(content)
                .pageNumber(students.getNumber())
                .pageSize(students.getSize())
                .totalElements(students.getTotalElements())
                .totalPages(students.getTotalPages())
                .last(students.isLast())
                .build();
    }

    @Override
    public PagedResponse<StudentResponse> getStudentsByDepartment(String department, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Department dept = departmentRepository.findByNameAndDeletedFalse(department).orElse(null);
        Page<Student> students = (dept != null) ? studentRepository.findByDepartmentIdAndDeletedFalse(dept.getId(), pageable) : Page.empty();

        List<StudentResponse> content = students.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PagedResponse.<StudentResponse>builder()
                .content(content)
                .pageNumber(students.getNumber())
                .pageSize(students.getSize())
                .totalElements(students.getTotalElements())
                .totalPages(students.getTotalPages())
                .last(students.isLast())
                .build();
    }

    @Override
    public StudentResponse updateProfile(String email, StudentProfileUpdateRequest request) {
        Student student = studentRepository.findByEmailAndDeletedFalse(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with email: " + email));

        if (request.getName() != null) student.setName(request.getName());
        if (request.getPhone() != null) student.setPhone(request.getPhone());
        if (request.getDepartment() != null) {
            departmentRepository.findByNameAndDeletedFalse(request.getDepartment())
                    .ifPresent(student::setDepartment);
        }
        if (request.getSemester() != null) student.setSemester(request.getSemester());
        if (request.getSection() != null) student.setSection(request.getSection());
        if (request.getAddress() != null) student.setAddress(request.getAddress());
        if (request.getInterests() != null) student.setInterests(request.getInterests());
        if (request.getSkills() != null) student.setSkills(request.getSkills());

        Student updatedStudent = studentRepository.save(student);
        return mapToResponse(updatedStudent);
    }

    @Override
    public void uploadProfileImage(String email, MultipartFile file) {
        Student student = studentRepository.findByEmailAndDeletedFalse(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with email: " + email));

        String filePath = fileUploadUtil.saveFile(file, "profile-images");
        
        student.setProfileImage(filePath);
        studentRepository.save(student);
    }

    @Override
    public void deactivateAccount(String email) {
        Student student = studentRepository.findByEmailAndDeletedFalse(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with email: " + email));
        student.setActive(false);
        studentRepository.save(student);
    }

    @Override
    public void deleteAccount(String email) {
        Student student = studentRepository.findByEmailAndDeletedFalse(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with email: " + email));
        student.setDeleted(true);
        student.setActive(false);
        studentRepository.save(student);
    }

    private StudentResponse mapToResponse(Student student) {
        StudentResponse response = modelMapper.map(student, StudentResponse.class);
        if (student.getUser() != null) {
            response.setName(student.getUser().getName());
            response.setEmail(student.getUser().getEmail());
            response.setPhone(student.getUser().getPhone());
        }
        if (student.getDepartment() != null) {
            response.setDepartment(student.getDepartment().getName());
        }
        return response;
    }
}
