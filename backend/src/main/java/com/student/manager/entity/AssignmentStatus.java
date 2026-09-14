package com.student.manager.entity;

public enum AssignmentStatus {
    PENDING,
    IN_PROGRESS,
    COMPLETED;

    public static AssignmentStatus fromString(String value) {
        if (value == null) return PENDING;
        try {
            return AssignmentStatus.valueOf(value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            return PENDING;
        }
    }
}
