package com.mentormatrix.dto.request;

import com.mentormatrix.enums.Gender;
import com.mentormatrix.validation.ValidPassword;
import com.mentormatrix.validation.ValidPhone;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentRegistrationRequest {
    @NotBlank
    private String name;

    @NotBlank
    private String usn;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @ValidPhone
    private String phone;

    @NotBlank
    @ValidPassword
    private String password;

    private String confirmPassword;

    @NotBlank
    private String department;

    @NotNull
    @Min(1)
    @Max(8)
    private Integer semester;

    @NotBlank
    private String section;

    @NotNull
    private Gender gender;

    @NotNull
    @Past
    private LocalDate dob;

    @NotBlank
    private String address;

    private String profileImage;
    private String interests;
    private String skills;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getUsn() { return usn; }
    public void setUsn(String usn) { this.usn = usn; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getConfirmPassword() { return confirmPassword; }
    public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }

    public Gender getGender() { return gender; }
    public void setGender(Gender gender) { this.gender = gender; }

    public LocalDate getDob() { return dob; }
    public void setDob(LocalDate dob) { this.dob = dob; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getProfileImage() { return profileImage; }
    public void setProfileImage(String profileImage) { this.profileImage = profileImage; }

    public String getInterests() { return interests; }
    public void setInterests(String interests) { this.interests = interests; }

    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }
}
