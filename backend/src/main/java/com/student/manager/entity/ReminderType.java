package com.student.manager.entity;

public enum ReminderType {
    ASSIGNMENT,
    EXAM,
    CUSTOM;

    public static ReminderType fromString(String value) {
        if (value == null) return CUSTOM;
        try {
            return ReminderType.valueOf(value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            return CUSTOM;
        }
    }
}
