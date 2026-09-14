package com.student.manager.dto;

import java.util.List;
import java.util.Map;

public class DashboardSummaryDto {
    private long totalAssignments;
    private long pendingAssignments;
    private long inProgressAssignments;
    private long completedAssignments;
    private long upcomingExamsCount;
    private double completionPercentage;
    private long unreadRemindersCount;

    private List<AssignmentDto> dueSoonAssignments;
    private List<AssignmentDto> todayTasks;
    private List<ExamDto> upcomingExams;
    private List<ReminderDto> urgentReminders;

    private Map<String, Long> assignmentsBySubject;
    private Map<String, Long> examsByPrepStatus;

    public DashboardSummaryDto() {}

    public long getTotalAssignments() { return totalAssignments; }
    public void setTotalAssignments(long totalAssignments) { this.totalAssignments = totalAssignments; }

    public long getPendingAssignments() { return pendingAssignments; }
    public void setPendingAssignments(long pendingAssignments) { this.pendingAssignments = pendingAssignments; }

    public long getInProgressAssignments() { return inProgressAssignments; }
    public void setInProgressAssignments(long inProgressAssignments) { this.inProgressAssignments = inProgressAssignments; }

    public long getCompletedAssignments() { return completedAssignments; }
    public void setCompletedAssignments(long completedAssignments) { this.completedAssignments = completedAssignments; }

    public long getUpcomingExamsCount() { return upcomingExamsCount; }
    public void setUpcomingExamsCount(long upcomingExamsCount) { this.upcomingExamsCount = upcomingExamsCount; }

    public double getCompletionPercentage() { return completionPercentage; }
    public void setCompletionPercentage(double completionPercentage) { this.completionPercentage = completionPercentage; }

    public long getUnreadRemindersCount() { return unreadRemindersCount; }
    public void setUnreadRemindersCount(long unreadRemindersCount) { this.unreadRemindersCount = unreadRemindersCount; }

    public List<AssignmentDto> getDueSoonAssignments() { return dueSoonAssignments; }
    public void setDueSoonAssignments(List<AssignmentDto> dueSoonAssignments) { this.dueSoonAssignments = dueSoonAssignments; }

    public List<AssignmentDto> getTodayTasks() { return todayTasks; }
    public void setTodayTasks(List<AssignmentDto> todayTasks) { this.todayTasks = todayTasks; }

    public List<ExamDto> getUpcomingExams() { return upcomingExams; }
    public void setUpcomingExams(List<ExamDto> upcomingExams) { this.upcomingExams = upcomingExams; }

    public List<ReminderDto> getUrgentReminders() { return urgentReminders; }
    public void setUrgentReminders(List<ReminderDto> urgentReminders) { this.urgentReminders = urgentReminders; }

    public Map<String, Long> getAssignmentsBySubject() { return assignmentsBySubject; }
    public void setAssignmentsBySubject(Map<String, Long> assignmentsBySubject) { this.assignmentsBySubject = assignmentsBySubject; }

    public Map<String, Long> getExamsByPrepStatus() { return examsByPrepStatus; }
    public void setExamsByPrepStatus(Map<String, Long> examsByPrepStatus) { this.examsByPrepStatus = examsByPrepStatus; }
}
