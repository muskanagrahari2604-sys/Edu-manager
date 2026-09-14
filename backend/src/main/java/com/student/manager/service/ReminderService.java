package com.student.manager.service;

import com.student.manager.config.UserContext;
import com.student.manager.dto.ReminderDto;
import com.student.manager.entity.*;
import com.student.manager.repository.AssignmentRepository;
import com.student.manager.repository.ExamRepository;
import com.student.manager.repository.ReminderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReminderService {

    private final ReminderRepository reminderRepository;
    private final AssignmentRepository assignmentRepository;
    private final ExamRepository examRepository;

    public ReminderService(ReminderRepository reminderRepository,
                           AssignmentRepository assignmentRepository,
                           ExamRepository examRepository) {
        this.reminderRepository = reminderRepository;
        this.assignmentRepository = assignmentRepository;
        this.examRepository = examRepository;
    }

    private User getAuthenticatedUser() {
        User user = UserContext.getCurrentUser();
        if (user == null) {
            throw new IllegalStateException("Authentication required to access reminders.");
        }
        return user;
    }

    @Transactional
    public List<ReminderDto> getAllReminders() {
        User user = getAuthenticatedUser();
        refreshSystemReminders(user);
        return reminderRepository.findByUserOrderByReminderDateDesc(user)
                .stream()
                .map(ReminderDto::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReminderDto createReminder(ReminderDto dto) {
        User user = getAuthenticatedUser();

        Reminder reminder = new Reminder();
        reminder.setUser(user);
        reminder.setTitle(dto.getTitle().trim());
        reminder.setMessage(dto.getMessage().trim());
        reminder.setReminderDate(dto.getReminderDate() != null ? dto.getReminderDate() : LocalDateTime.now());
        reminder.setReminderType(dto.getReminderType() != null ? dto.getReminderType() : ReminderType.CUSTOM);
        reminder.setIsRead(false);

        Reminder saved = reminderRepository.save(reminder);
        return new ReminderDto(saved);
    }

    @Transactional
    public ReminderDto markAsRead(Long id) {
        User user = getAuthenticatedUser();
        Reminder reminder = reminderRepository.findById(id)
                .filter(r -> r.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Reminder not found with id: " + id));

        reminder.setIsRead(true);
        Reminder updated = reminderRepository.save(reminder);
        return new ReminderDto(updated);
    }

    @Transactional
    public void markAllAsRead() {
        User user = getAuthenticatedUser();
        List<Reminder> unread = reminderRepository.findByUserAndIsReadFalseOrderByReminderDateAsc(user);
        for (Reminder r : unread) {
            r.setIsRead(true);
        }
        reminderRepository.saveAll(unread);
    }

    @Transactional
    public void deleteReminder(Long id) {
        User user = getAuthenticatedUser();
        Reminder reminder = reminderRepository.findById(id)
                .filter(r -> r.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Reminder not found with id: " + id));

        reminderRepository.delete(reminder);
    }

    /**
     * Automatic Reminder Generator: Inspects deadlines and exams
     */
    @Transactional
    public void refreshSystemReminders(User user) {
        LocalDateTime now = LocalDateTime.now();
        List<Assignment> pending = assignmentRepository.findByUserAndStatusOrderByDueDateAsc(user, AssignmentStatus.PENDING);
        List<Assignment> inProgress = assignmentRepository.findByUserAndStatusOrderByDueDateAsc(user, AssignmentStatus.IN_PROGRESS);
        pending.addAll(inProgress);

        List<Reminder> existing = reminderRepository.findByUserOrderByReminderDateDesc(user);

        for (Assignment a : pending) {
            long hoursLeft = ChronoUnit.HOURS.between(now, a.getDueDate());
            if (hoursLeft < 0) {
                // Overdue
                String title = "Overdue: " + a.getTitle();
                if (existing.stream().noneMatch(r -> title.equals(r.getTitle()))) {
                    Reminder r = new Reminder(user, title,
                            "Assignment '" + a.getTitle() + "' for " + a.getSubject() + " was due on " + a.getDueDate().toLocalDate() + ". Submit ASAP!",
                            now, ReminderType.ASSIGNMENT, a.getId());
                    reminderRepository.save(r);
                }
            } else if (hoursLeft <= 24) {
                // Due tomorrow
                String title = "Due Tomorrow: " + a.getTitle();
                if (existing.stream().noneMatch(r -> title.equals(r.getTitle()))) {
                    Reminder r = new Reminder(user, title,
                            "Assignment '" + a.getTitle() + "' for " + a.getSubject() + " is due tomorrow at " + a.getDueDate().toLocalTime() + ".",
                            now, ReminderType.ASSIGNMENT, a.getId());
                    reminderRepository.save(r);
                }
            }
        }

        // Upcoming exams in next 7 days
        List<Exam> upcomingExams = examRepository.findUpcomingExams(user, LocalDate.now());
        for (Exam e : upcomingExams) {
            long daysLeft = ChronoUnit.DAYS.between(LocalDate.now(), e.getExamDate());
            if (daysLeft <= 7) {
                String title = "Upcoming Exam: " + e.getSubject();
                if (existing.stream().noneMatch(r -> title.equals(r.getTitle()))) {
                    Reminder r = new Reminder(user, title,
                            e.getExamTitle() + " for " + e.getSubject() + " is scheduled for " + e.getExamDate() + " at " + e.getExamTime() + " in " + e.getVenue() + ".",
                            now, ReminderType.EXAM, e.getId());
                    reminderRepository.save(r);
                }
            }
        }
    }
}
