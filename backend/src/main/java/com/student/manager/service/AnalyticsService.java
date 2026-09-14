package com.student.manager.service;

import com.student.manager.config.UserContext;
import com.student.manager.dto.*;
import com.student.manager.entity.Assignment;
import com.student.manager.entity.AssignmentStatus;
import com.student.manager.entity.Exam;
import com.student.manager.entity.User;
import com.student.manager.repository.AssignmentRepository;
import com.student.manager.repository.ExamRepository;
import com.student.manager.repository.ReminderRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final AssignmentRepository assignmentRepository;
    private final ExamRepository examRepository;
    private final ReminderRepository reminderRepository;
    private final ReminderService reminderService;

    public AnalyticsService(AssignmentRepository assignmentRepository,
                            ExamRepository examRepository,
                            ReminderRepository reminderRepository,
                            ReminderService reminderService) {
        this.assignmentRepository = assignmentRepository;
        this.examRepository = examRepository;
        this.reminderRepository = reminderRepository;
        this.reminderService = reminderService;
    }

    private User getAuthenticatedUser() {
        User user = UserContext.getCurrentUser();
        if (user == null) {
            throw new IllegalStateException("Authentication required for analytics.");
        }
        return user;
    }

    public DashboardSummaryDto getDashboardSummary() {
        User user = getAuthenticatedUser();
        reminderService.refreshSystemReminders(user);

        List<Assignment> allAssignments = assignmentRepository.findByUserOrderByDueDateAsc(user);
        List<Exam> upcomingExams = examRepository.findUpcomingExams(user, LocalDate.now());

        long totalAssignments = allAssignments.size();
        long completedAssignments = allAssignments.stream().filter(a -> a.getStatus() == AssignmentStatus.COMPLETED).count();
        long inProgressAssignments = allAssignments.stream().filter(a -> a.getStatus() == AssignmentStatus.IN_PROGRESS).count();
        long pendingAssignments = allAssignments.stream().filter(a -> a.getStatus() == AssignmentStatus.PENDING).count();

        double completionPercentage = totalAssignments > 0
                ? Math.round(((double) completedAssignments / totalAssignments) * 100.0 * 10.0) / 10.0
                : 0.0;

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime next72h = now.plusHours(72);
        LocalDate today = LocalDate.now();

        List<AssignmentDto> dueSoon = allAssignments.stream()
                .filter(a -> a.getStatus() != AssignmentStatus.COMPLETED && a.getDueDate().isBefore(next72h))
                .map(AssignmentDto::new)
                .collect(Collectors.toList());

        List<AssignmentDto> todayTasks = allAssignments.stream()
                .filter(a -> a.getDueDate().toLocalDate().isEqual(today))
                .map(AssignmentDto::new)
                .collect(Collectors.toList());

        List<ReminderDto> urgentReminders = reminderRepository.findByUserAndIsReadFalseOrderByReminderDateAsc(user)
                .stream()
                .limit(5)
                .map(ReminderDto::new)
                .collect(Collectors.toList());

        Map<String, Long> subjectMap = allAssignments.stream()
                .collect(Collectors.groupingBy(Assignment::getSubject, Collectors.counting()));

        Map<String, Long> examStatusMap = upcomingExams.stream()
                .collect(Collectors.groupingBy(e -> e.getPreparationStatus().name(), Collectors.counting()));

        DashboardSummaryDto dto = new DashboardSummaryDto();
        dto.setTotalAssignments(totalAssignments);
        dto.setPendingAssignments(pendingAssignments);
        dto.setInProgressAssignments(inProgressAssignments);
        dto.setCompletedAssignments(completedAssignments);
        dto.setUpcomingExamsCount(upcomingExams.size());
        dto.setCompletionPercentage(completionPercentage);
        dto.setUnreadRemindersCount(reminderRepository.countByUserAndIsReadFalse(user));

        dto.setDueSoonAssignments(dueSoon);
        dto.setTodayTasks(todayTasks);
        dto.setUpcomingExams(upcomingExams.stream().limit(5).map(ExamDto::new).collect(Collectors.toList()));
        dto.setUrgentReminders(urgentReminders);
        dto.setAssignmentsBySubject(subjectMap);
        dto.setExamsByPrepStatus(examStatusMap);

        return dto;
    }

    public AnalyticsDto getAnalytics() {
        User user = getAuthenticatedUser();
        List<Assignment> allAssignments = assignmentRepository.findByUserOrderByDueDateAsc(user);
        List<Exam> allExams = examRepository.findByUserOrderByExamDateAscExamTimeAsc(user);
        List<Exam> upcomingExams = examRepository.findUpcomingExams(user, LocalDate.now());

        long total = allAssignments.size();
        long completed = allAssignments.stream().filter(a -> a.getStatus() == AssignmentStatus.COMPLETED).count();
        long inProgress = allAssignments.stream().filter(a -> a.getStatus() == AssignmentStatus.IN_PROGRESS).count();
        long pending = allAssignments.stream().filter(a -> a.getStatus() == AssignmentStatus.PENDING).count();
        double rate = total > 0 ? Math.round(((double) completed / total) * 100.0 * 10.0) / 10.0 : 0.0;

        Map<String, Long> subjects = allAssignments.stream()
                .collect(Collectors.groupingBy(Assignment::getSubject, Collectors.counting()));

        Map<String, Long> priorities = allAssignments.stream()
                .collect(Collectors.groupingBy(a -> a.getPriority().name(), Collectors.counting()));

        Map<String, Long> examPrep = allExams.stream()
                .collect(Collectors.groupingBy(e -> e.getPreparationStatus().name(), Collectors.counting()));

        DateTimeFormatter monthFmt = DateTimeFormatter.ofPattern("MMM yyyy");
        Map<String, Long> monthly = new LinkedHashMap<>();
        for (Assignment a : allAssignments) {
            if (a.getStatus() == AssignmentStatus.COMPLETED && a.getUpdatedAt() != null) {
                String monthKey = a.getUpdatedAt().format(monthFmt);
                monthly.put(monthKey, monthly.getOrDefault(monthKey, 0L) + 1);
            }
        }

        AnalyticsDto dto = new AnalyticsDto();
        dto.setTotalAssignments(total);
        dto.setCompletedAssignments(completed);
        dto.setPendingAssignments(pending);
        dto.setInProgressAssignments(inProgress);
        dto.setCompletionRate(rate);
        dto.setTotalExams(allExams.size());
        dto.setUpcomingExams(upcomingExams.size());
        dto.setSubjectBreakdown(subjects);
        dto.setPriorityBreakdown(priorities);
        dto.setExamStatusBreakdown(examPrep);
        dto.setMonthlyCompletion(monthly);

        return dto;
    }
}
