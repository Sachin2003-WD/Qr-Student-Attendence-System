package com.mentormatrix.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentResponse {
    private Long id;
    private String usn;
    private String name;
    private String email;
    private String phone;
    private String department;
    private Integer semester;
    private String section;
    private String gender;
    private String dob;
    private String address;
    private String profileImage;
    private String interests;
    private String skills;
    private Boolean active;
    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsn() { return usn; }
    public void setUsn(String usn) { this.usn = usn; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }
    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public String getDob() { return dob; }
    public void setDob(String dob) { this.dob = dob; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getProfileImage() { return profileImage; }
    public void setProfileImage(String profileImage) { this.profileImage = profileImage; }
    public String getInterests() { return interests; }
    public void setInterests(String interests) { this.interests = interests; }
    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static StudentResponseBuilder builder() {
        return new StudentResponseBuilder();
    }

    public static class StudentResponseBuilder {
        private Long id;
        private String usn;
        private String name;
        private String email;
        private String phone;
        private String department;
        private Integer semester;
        private String section;
        private String gender;
        private String dob;
        private String address;
        private String profileImage;
        private String interests;
        private String skills;
        private Boolean active;
        private LocalDateTime createdAt;

        public StudentResponseBuilder id(Long id) { this.id = id; return this; }
        public StudentResponseBuilder usn(String usn) { this.usn = usn; return this; }
        public StudentResponseBuilder name(String name) { this.name = name; return this; }
        public StudentResponseBuilder email(String email) { this.email = email; return this; }
        public StudentResponseBuilder phone(String phone) { this.phone = phone; return this; }
        public StudentResponseBuilder department(String department) { this.department = department; return this; }
        public StudentResponseBuilder semester(Integer semester) { this.semester = semester; return this; }
        public StudentResponseBuilder section(String section) { this.section = section; return this; }
        public StudentResponseBuilder gender(String gender) { this.gender = gender; return this; }
        public StudentResponseBuilder dob(String dob) { this.dob = dob; return this; }
        public StudentResponseBuilder address(String address) { this.address = address; return this; }
        public StudentResponseBuilder profileImage(String profileImage) { this.profileImage = profileImage; return this; }
        public StudentResponseBuilder interests(String interests) { this.interests = interests; return this; }
        public StudentResponseBuilder skills(String skills) { this.skills = skills; return this; }
        public StudentResponseBuilder active(Boolean active) { this.active = active; return this; }
        public StudentResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public StudentResponse build() {
            StudentResponse s = new StudentResponse();
            s.setId(id);
            s.setUsn(usn);
            s.setName(name);
            s.setEmail(email);
            s.setPhone(phone);
            s.setDepartment(department);
            s.setSemester(semester);
            s.setSection(section);
            s.setGender(gender);
            s.setDob(dob);
            s.setAddress(address);
            s.setProfileImage(profileImage);
            s.setInterests(interests);
            s.setSkills(skills);
            s.setActive(active);
            s.setCreatedAt(createdAt);
            return s;
        }
    }
}
