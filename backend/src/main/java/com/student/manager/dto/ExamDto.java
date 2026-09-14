package com.student.manager.dto;

import com.student.manager.entity.Exam;
import com.student.manager.entity.PreparationStatus;
import com.student.manager.entity.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

public class ExamDto {
    private Long id;

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Exam title is required")
    private String examTitle;

    @NotNull(message = "Exam date is required")
    private LocalDate examDate;

    @NotNull(message = "Exam time is required")
    private LocalTime examTime;

    private String venue;
    private String syllabus;
    private PreparationStatus preparationStatus = PreparationStatus.NOT_STARTED;
    private Priority priority = Priority.HIGH;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ExamDto() {}

    public ExamDto(Exam exam) {
        if (exam != null) {
            this.id = exam.getId();
            this.subject = exam.getSubject();
            this.examTitle = exam.getExamTitle();
            this.examDate = exam.getExamDate();
            this.examTime = exam.getExamTime();
            this.venue = exam.getVenue();
            this.syllabus = exam.getSyllabus();
            this.preparationStatus = exam.getPreparationStatus();
            this.priority = exam.getPriority();
            this.createdAt = exam.getCreatedAt();
            this.updatedAt = exam.getUpdatedAt();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getExamTitle() { return examTitle; }
    public void setExamTitle(String examTitle) { this.examTitle = examTitle; }

    public LocalDate getExamDate() { return examDate; }
    public void setExamDate(LocalDate examDate) { this.examDate = examDate; }

    public LocalTime getExamTime() { return examTime; }
    public void setExamTime(LocalTime examTime) { this.examTime = examTime; }

    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }

    public String getSyllabus() { return syllabus; }
    public void setSyllabus(String syllabus) { this.syllabus = syllabus; }

    public PreparationStatus getPreparationStatus() { return preparationStatus; }
    public void setPreparationStatus(PreparationStatus preparationStatus) { this.preparationStatus = preparationStatus; }

    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
