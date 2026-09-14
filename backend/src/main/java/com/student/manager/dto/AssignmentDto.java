package com.student.manager.dto;

import com.student.manager.entity.Assignment;
import com.student.manager.entity.AssignmentStatus;
import com.student.manager.entity.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class AssignmentDto {
    private Long id;

    @NotBlank(message = "Assignment title is required")
    private String title;

    @NotBlank(message = "Subject is required")
    private String subject;

    private String description;

    @NotNull(message = "Due date is required")
    private LocalDateTime dueDate;

    private Priority priority = Priority.MEDIUM;
    private AssignmentStatus status = AssignmentStatus.PENDING;
    private String attachmentName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public AssignmentDto() {}

    public AssignmentDto(Assignment assignment) {
        if (assignment != null) {
            this.id = assignment.getId();
            this.title = assignment.getTitle();
            this.subject = assignment.getSubject();
            this.description = assignment.getDescription();
            this.dueDate = assignment.getDueDate();
            this.priority = assignment.getPriority();
            this.status = assignment.getStatus();
            this.attachmentName = assignment.getAttachmentName();
            this.createdAt = assignment.getCreatedAt();
            this.updatedAt = assignment.getUpdatedAt();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }

    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }

    public AssignmentStatus getStatus() { return status; }
    public void setStatus(AssignmentStatus status) { this.status = status; }

    public String getAttachmentName() { return attachmentName; }
    public void setAttachmentName(String attachmentName) { this.attachmentName = attachmentName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
