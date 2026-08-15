package com.mentormatrix.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;

@Entity
@Table(name = "batches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Batch extends BaseEntity {

    @NotBlank(message = "Batch name is required")
    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "batch_code", length = 50)
    private String batchCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(name = "department_name", length = 100)
    private String departmentName;

    @Column(name = "department_code", length = 20)
    private String departmentCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = true)
    private Course course;

    @Column(name = "start_year")
    private Integer startYear;

    @Column(name = "end_year")
    private Integer endYear;

    @Column(length = 10)
    private String section;

    @Column
    private Integer semester;

    @Column(length = 100)
    private String branch;

    @Column(name = "class_timing", length = 30)
    private String classTiming;

    @Column(name = "subject_name", length = 100)
    private String subjectName;

    @Column(name = "trainer_name", length = 100)
    private String trainerName;

    @Column(name = "start_date")
    private LocalDate startDate;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getBatchCode() { return batchCode; }
    public void setBatchCode(String batchCode) { this.batchCode = batchCode; }
    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }
    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }
    public String getDepartmentCode() { return departmentCode; }
    public void setDepartmentCode(String departmentCode) { this.departmentCode = departmentCode; }
    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }
    public Integer getStartYear() { return startYear; }
    public void setStartYear(Integer startYear) { this.startYear = startYear; }
    public Integer getEndYear() { return endYear; }
    public void setEndYear(Integer endYear) { this.endYear = endYear; }
    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }
    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }
    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }
    public String getClassTiming() { return classTiming; }
    public void setClassTiming(String classTiming) { this.classTiming = classTiming; }
    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }
    public String getTrainerName() { return trainerName; }
    public void setTrainerName(String trainerName) { this.trainerName = trainerName; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public static BatchBuilder builder() {
        return new BatchBuilder();
    }

    public static class BatchBuilder {
        private String name;
        private String batchCode;
        private Department department;
        private String departmentName;
        private String departmentCode;
        private Course course;
        private Integer startYear;
        private Integer endYear;
        private String section;
        private Integer semester;
        private String branch;
        private String classTiming;
        private String subjectName;
        private String trainerName;
        private LocalDate startDate;
        private Boolean active = true;
        private Boolean deleted = false;

        public BatchBuilder name(String name) { this.name = name; return this; }
        public BatchBuilder batchCode(String batchCode) { this.batchCode = batchCode; return this; }
        public BatchBuilder department(Department department) { this.department = department; return this; }
        public BatchBuilder departmentName(String departmentName) { this.departmentName = departmentName; return this; }
        public BatchBuilder departmentCode(String departmentCode) { this.departmentCode = departmentCode; return this; }
        public BatchBuilder course(Course course) { this.course = course; return this; }
        public BatchBuilder startYear(Integer startYear) { this.startYear = startYear; return this; }
        public BatchBuilder endYear(Integer endYear) { this.endYear = endYear; return this; }
        public BatchBuilder section(String section) { this.section = section; return this; }
        public BatchBuilder semester(Integer semester) { this.semester = semester; return this; }
        public BatchBuilder branch(String branch) { this.branch = branch; return this; }
        public BatchBuilder classTiming(String classTiming) { this.classTiming = classTiming; return this; }
        public BatchBuilder subjectName(String subjectName) { this.subjectName = subjectName; return this; }
        public BatchBuilder trainerName(String trainerName) { this.trainerName = trainerName; return this; }
        public BatchBuilder startDate(LocalDate startDate) { this.startDate = startDate; return this; }
        public BatchBuilder active(Boolean active) { this.active = active; return this; }
        public BatchBuilder deleted(Boolean deleted) { this.deleted = deleted; return this; }

        public Batch build() {
            Batch b = new Batch();
            b.setName(name);
            b.setBatchCode(batchCode);
            b.setDepartment(department);
            b.setDepartmentName(departmentName);
            b.setDepartmentCode(departmentCode);
            b.setCourse(course);
            b.setStartYear(startYear != null ? startYear : 2024);
            b.setEndYear(endYear != null ? endYear : 2026);
            b.setSection(section);
            b.setSemester(semester != null ? semester : 5);
            b.setBranch(branch != null ? branch : "");
            b.setClassTiming(classTiming != null ? classTiming : "");
            b.setSubjectName(subjectName != null ? subjectName : "");
            b.setTrainerName(trainerName != null ? trainerName : "");
            b.setStartDate(startDate != null ? startDate : LocalDate.now());
            b.setActive(active != null ? active : true);
            b.setDeleted(deleted != null ? deleted : false);
            return b;
        }
    }
}
