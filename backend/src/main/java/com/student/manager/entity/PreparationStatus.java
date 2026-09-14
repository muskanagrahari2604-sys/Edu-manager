package com.student.manager.entity;

public enum PreparationStatus {
    NOT_STARTED,
    IN_PROGRESS,
    WELL_PREPARED,
    REVIEWING;

    public static PreparationStatus fromString(String value) {
        if (value == null) return NOT_STARTED;
        try {
            return PreparationStatus.valueOf(value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            return NOT_STARTED;
        }
    }
}
