package com.student.manager.entity;

public enum Priority {
    LOW,
    MEDIUM,
    HIGH;

    public static Priority fromString(String value) {
        if (value == null) return MEDIUM;
        try {
            return Priority.valueOf(value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            return MEDIUM;
        }
    }
}
