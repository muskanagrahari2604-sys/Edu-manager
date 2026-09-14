package com.student.manager.dto;

import java.util.Map;

public class AnalyticsDto {
    private long totalAssignments;
    private long completedAssignments;
    private long pendingAssignments;
    private long inProgressAssignments;
    private double completionRate;
    private long totalExams;
    private long upcomingExams;

    private Map<String, Long> subjectBreakdown;
    private Map<String, Long> priorityBreakdown;
    private Map<String, Long> examStatusBreakdown;
    private Map<String, Long> monthlyCompletion;

    public AnalyticsDto() {}

    public long getTotalAssignments() { return totalAssignments; }
    public void setTotalAssignments(long totalAssignments) { this.totalAssignments = totalAssignments; }

    public long getCompletedAssignments() { return completedAssignments; }
    public void setCompletedAssignments(long completedAssignments) { this.completedAssignments = completedAssignments; }

    public long getPendingAssignments() { return pendingAssignments; }
    public void setPendingAssignments(long pendingAssignments) { this.pendingAssignments = pendingAssignments; }

    public long getInProgressAssignments() { return inProgressAssignments; }
    public void setInProgressAssignments(long inProgressAssignments) { this.inProgressAssignments = inProgressAssignments; }

    public double getCompletionRate() { return completionRate; }
    public void setCompletionRate(double completionRate) { this.completionRate = completionRate; }

    public long getTotalExams() { return totalExams; }
    public void setTotalExams(long totalExams) { this.totalExams = totalExams; }

    public long getUpcomingExams() { return upcomingExams; }
    public void setUpcomingExams(long upcomingExams) { this.upcomingExams = upcomingExams; }

    public Map<String, Long> getSubjectBreakdown() { return subjectBreakdown; }
    public void setSubjectBreakdown(Map<String, Long> subjectBreakdown) { this.subjectBreakdown = subjectBreakdown; }

    public Map<String, Long> getPriorityBreakdown() { return priorityBreakdown; }
    public void setPriorityBreakdown(Map<String, Long> priorityBreakdown) { this.priorityBreakdown = priorityBreakdown; }

    public Map<String, Long> getExamStatusBreakdown() { return examStatusBreakdown; }
    public void setExamStatusBreakdown(Map<String, Long> examStatusBreakdown) { this.examStatusBreakdown = examStatusBreakdown; }

    public Map<String, Long> getMonthlyCompletion() { return monthlyCompletion; }
    public void setMonthlyCompletion(Map<String, Long> monthlyCompletion) { this.monthlyCompletion = monthlyCompletion; }
}
