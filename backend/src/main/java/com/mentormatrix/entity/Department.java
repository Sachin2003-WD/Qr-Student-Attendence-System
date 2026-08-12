package com.mentormatrix.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "departments", uniqueConstraints = {
        @UniqueConstraint(name = "uk_departments_code", columnNames = "code"),
        @UniqueConstraint(name = "uk_departments_name", columnNames = "name")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Department extends BaseEntity {

    @NotBlank(message = "Department name is required")
    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @NotBlank(message = "Department code is required")
    @Column(nullable = false, unique = true, length = 20)
    private String code;

    @Column(columnDefinition = "TEXT")
    private String description;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public static DepartmentBuilder builder() {
        return new DepartmentBuilder();
    }

    public static class DepartmentBuilder {
        private String name;
        private String code;
        private String description;
        private Boolean active = true;
        private Boolean deleted = false;

        public DepartmentBuilder name(String name) { this.name = name; return this; }
        public DepartmentBuilder code(String code) { this.code = code; return this; }
        public DepartmentBuilder description(String description) { this.description = description; return this; }
        public DepartmentBuilder active(Boolean active) { this.active = active; return this; }
        public DepartmentBuilder deleted(Boolean deleted) { this.deleted = deleted; return this; }

        public Department build() {
            Department d = new Department();
            d.setName(name);
            d.setCode(code);
            d.setDescription(description);
            d.setActive(active != null ? active : true);
            d.setDeleted(deleted != null ? deleted : false);
            return d;
        }
    }
}
