package com.mentormatrix.dto.request;

import com.mentormatrix.validation.ValidPhone;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfileUpdateRequest {
    private String name;
    
    @ValidPhone
    private String phone;
    
    private String department;
    
    @Min(1)
    @Max(8)
    private Integer semester;
    
    private String section;
    private String address;
    private String interests;
    private String skills;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }
    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getInterests() { return interests; }
    public void setInterests(String interests) { this.interests = interests; }
    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }
}
