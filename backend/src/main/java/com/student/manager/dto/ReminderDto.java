package com.student.manager.dto;

import com.student.manager.entity.Reminder;
import com.student.manager.entity.ReminderType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class ReminderDto {
    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Message is required")
    private String message;

    @NotNull(message = "Reminder date is required")
    private LocalDateTime reminderDate;

    private Boolean isRead = false;
    private ReminderType reminderType = ReminderType.CUSTOM;
    private Long referenceId;
    private LocalDateTime createdAt;

    public ReminderDto() {}

    public ReminderDto(Reminder reminder) {
        if (reminder != null) {
            this.id = reminder.getId();
            this.title = reminder.getTitle();
            this.message = reminder.getMessage();
            this.reminderDate = reminder.getReminderDate();
            this.isRead = reminder.getIsRead();
            this.reminderType = reminder.getReminderType();
            this.referenceId = reminder.getReferenceId();
            this.createdAt = reminder.getCreatedAt();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getReminderDate() { return reminderDate; }
    public void setReminderDate(LocalDateTime reminderDate) { this.reminderDate = reminderDate; }

    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean read) { isRead = read; }

    public ReminderType getReminderType() { return reminderType; }
    public void setReminderType(ReminderType reminderType) { this.reminderType = reminderType; }

    public Long getReferenceId() { return referenceId; }
    public void setReferenceId(Long referenceId) { this.referenceId = referenceId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
