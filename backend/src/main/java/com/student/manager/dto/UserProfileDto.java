package com.student.manager.dto;

import com.student.manager.entity.User;

import java.time.LocalDateTime;

public class UserProfileDto {
    private Long id;
    private String name;
    private String email;
    private String department;
    private String semester;
    private String avatarUrl;
    private LocalDateTime createdAt;

    public UserProfileDto() {}

    public UserProfileDto(User user) {
        if (user != null) {
            this.id = user.getId();
            this.name = user.getName();
            this.email = user.getEmail();
            this.department = user.getDepartment();
            this.semester = user.getSemester();
            this.avatarUrl = user.getAvatarUrl();
            this.createdAt = user.getCreatedAt();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
