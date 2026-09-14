-- ====================================================================
-- Sample Seed Data for Student Assignment & Exam Manager
-- ====================================================================

USE student_manager_db;

-- --------------------------------------------------------------------
-- Insert Sample Users
-- Password for all sample users is: student123 (BCrypt hash)
-- --------------------------------------------------------------------
INSERT INTO users (id, name, email, password, department, semester) VALUES
(1, 'Alex Morgan', 'alex.morgan@university.edu', '$2a$10$wN30sT9Q7bQ4hK2W9yqKfeYjT1vM3fM1a7M3X6T5rZ1M6hN0k3q3W', 'Computer Science & Engineering', 'Fall 2026'),
(2, 'Sarah Jenkins', 'sarah.j@university.edu', '$2a$10$wN30sT9Q7bQ4hK2W9yqKfeYjT1vM3fM1a7M3X6T5rZ1M6hN0k3q3W', 'Data Science & Analytics', 'Fall 2026');

-- --------------------------------------------------------------------
-- Insert Assignments for Alex Morgan (user_id: 1)
-- --------------------------------------------------------------------
INSERT INTO assignments (id, user_id, title, subject, description, due_date, priority, status, attachment_name, created_at) VALUES
(1, 1, 'B-Tree & Red-Black Tree Implementation', 'Data Structures & Algorithms', 'Implement self-balancing search trees in C++ with test cases for insertion, deletion, and inorder traversal benchmarks.', DATE_ADD(NOW(), INTERVAL 1 DAY), 'HIGH', 'IN_PROGRESS', 'ds_trees_spec.pdf', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(2, 1, 'Virtual Memory & Page Replacement Simulation', 'Operating Systems', 'Build an LRU, FIFO, and Optimal page replacement simulator in Python with a comprehensive analysis report comparing page fault rates.', DATE_ADD(NOW(), INTERVAL 3 DAY), 'HIGH', 'PENDING', 'os_lab_instructions.pdf', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(3, 1, 'E-Commerce Schema Design & Index Optimization', 'Database Management Systems', 'Design normalized relational schema (3NF) for high-concurrency bookstore. Include complex queries and EXPLAIN query plan analysis.', DATE_ADD(NOW(), INTERVAL 5 DAY), 'MEDIUM', 'IN_PROGRESS', 'dbms_project_rubric.docx', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(4, 1, 'TCP Congestion Control Analysis (Cubic vs BBR)', 'Computer Networks', 'Analyze packet capture traces using Wireshark to measure throughput, packet loss, and RTT variance across different congestion algorithms.', DATE_ADD(NOW(), INTERVAL 7 DAY), 'LOW', 'PENDING', 'wireshark_traces.pcap', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(5, 1, 'Convolutional Neural Network for Digit Recognition', 'Machine Learning', 'Train a CNN model on MNIST / CIFAR-10 with data augmentation, dropout regularization, and plot loss curves.', DATE_SUB(NOW(), INTERVAL 2 DAY), 'HIGH', 'COMPLETED', 'cnn_final_notebook.ipynb', DATE_SUB(NOW(), INTERVAL 8 DAY)),
(6, 1, 'Software Architecture Pattern Case Study', 'Software Engineering', 'Write a 6-page research report evaluating microservices vs event-driven architectural patterns for modern banking platforms.', DATE_SUB(NOW(), INTERVAL 5 DAY), 'MEDIUM', 'COMPLETED', 'software_arch_paper.pdf', DATE_SUB(NOW(), INTERVAL 10 DAY));

-- --------------------------------------------------------------------
-- Insert Exams for Alex Morgan (user_id: 1)
-- --------------------------------------------------------------------
INSERT INTO exams (id, user_id, subject, exam_title, exam_date, exam_time, venue, syllabus, preparation_status, priority, created_at) VALUES
(1, 1, 'Data Structures & Algorithms', 'Midterm Examination', DATE_ADD(CURDATE(), INTERVAL 4 DAY), '09:30:00', 'Hall A - Engineering Quad, Room 302', 'Arrays, Linked Lists, Stacks, Queues, Binary Heaps, AVL Trees, Graph Traversals (BFS/DFS), Dynamic Programming fundamentals.', 'IN_PROGRESS', 'HIGH', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, 1, 'Operating Systems', 'Lab Practical & Theory Exam', DATE_ADD(CURDATE(), INTERVAL 8 DAY), '14:00:00', 'Computer Systems Lab 2B', 'Process Management, Threads, POSIX Semaphores, Deadlock detection algorithms, CPU Scheduling, Virtual Memory architecture.', 'REVIEWING', 'HIGH', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(3, 1, 'Database Management Systems', 'Periodic Quiz & Query Challenge', DATE_ADD(CURDATE(), INTERVAL 12 DAY), '11:00:00', 'Science Building - Aud 101', 'Relational Algebra, SQL Subqueries, Aggregations, B+ Trees indexing, Transaction ACID properties, Two-Phase Locking.', 'NOT_STARTED', 'MEDIUM', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(4, 1, 'Computer Networks', 'Final Comprehensive Exam', DATE_ADD(CURDATE(), INTERVAL 20 DAY), '10:00:00', 'Main Campus Auditorium', 'OSI 7-Layer & TCP/IP stack, DNS, HTTP/3, Reliable Data Transfer protocols, BGP routing, Cryptographic security principles.', 'NOT_STARTED', 'HIGH', DATE_SUB(NOW(), INTERVAL 2 DAY));

-- --------------------------------------------------------------------
-- Insert Reminders for Alex Morgan (user_id: 1)
-- --------------------------------------------------------------------
INSERT INTO reminders (id, user_id, title, message, reminder_date, is_read, reminder_type, reference_id, created_at) VALUES
(1, 1, 'Assignment Due Tomorrow!', 'Your B-Tree & Red-Black Tree implementation for Data Structures is due tomorrow at 11:59 PM. Complete benchmarks and submit on portal.', DATE_ADD(NOW(), INTERVAL 1 DAY), FALSE, 'ASSIGNMENT', 1, NOW()),
(2, 1, 'Upcoming Midterm Exam', 'Data Structures & Algorithms Midterm Exam is in 4 days at Hall A Room 302. Don''t forget your university ID card.', DATE_ADD(NOW(), INTERVAL 4 DAY), FALSE, 'EXAM', 1, NOW()),
(3, 1, 'OS Lab Simulator Deadline Approaching', 'Virtual Memory & Page Replacement simulator due in 3 days. Verify report graphs.', DATE_ADD(NOW(), INTERVAL 3 DAY), FALSE, 'ASSIGNMENT', 2, NOW()),
(4, 1, 'Study Group Session', 'Library Room 405 group study session on Dynamic Programming with study group at 6:00 PM today.', NOW(), TRUE, 'CUSTOM', NULL, DATE_SUB(NOW(), INTERVAL 1 DAY));
