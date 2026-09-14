-- ====================================================================
-- Student Assignment & Exam Manager Database Schema (MySQL 8.0+)
-- ====================================================================

-- Create Database if not exists
CREATE DATABASE IF NOT EXISTS student_manager_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE student_manager_db;

-- Drop tables in reverse order of foreign key dependencies
DROP TABLE IF EXISTS reminders;
DROP TABLE IF EXISTS exams;
DROP TABLE IF EXISTS assignments;
DROP TABLE IF EXISTS users;

-- --------------------------------------------------------------------
-- Table: users
-- --------------------------------------------------------------------
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    department VARCHAR(100) DEFAULT 'Computer Science',
    semester VARCHAR(50) DEFAULT 'Fall 2026',
    avatar_url VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- Table: assignments
-- --------------------------------------------------------------------
CREATE TABLE assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    description TEXT,
    due_date DATETIME NOT NULL,
    priority ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL DEFAULT 'MEDIUM',
    status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
    attachment_name VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_assignment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_assignment_user_status (user_id, status),
    INDEX idx_assignment_due_date (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- Table: exams
-- --------------------------------------------------------------------
CREATE TABLE exams (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    subject VARCHAR(100) NOT NULL,
    exam_title VARCHAR(150) NOT NULL,
    exam_date DATE NOT NULL,
    exam_time TIME NOT NULL,
    venue VARCHAR(150) DEFAULT 'Main Academic Hall',
    syllabus TEXT,
    preparation_status ENUM('NOT_STARTED', 'IN_PROGRESS', 'WELL_PREPARED', 'REVIEWING') NOT NULL DEFAULT 'NOT_STARTED',
    priority ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL DEFAULT 'HIGH',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_exam_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_exam_user_date (user_id, exam_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- Table: reminders
-- --------------------------------------------------------------------
CREATE TABLE reminders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    reminder_date DATETIME NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    reminder_type ENUM('ASSIGNMENT', 'EXAM', 'CUSTOM') NOT NULL DEFAULT 'CUSTOM',
    reference_id BIGINT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reminder_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_reminder_user_date (user_id, reminder_date),
    INDEX idx_reminder_user_unread (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
