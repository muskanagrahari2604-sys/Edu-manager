-- Sample seed data for Spring Boot initialization
INSERT INTO users (id, name, email, password, department, semester)
SELECT 1, 'Alex Morgan', 'alex.morgan@university.edu', '$2a$10$wN30sT9Q7bQ4hK2W9yqKfeYjT1vM3fM1a7M3X6T5rZ1M6hN0k3q3W', 'Computer Science & Engineering', 'Fall 2026'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 1);

INSERT INTO assignments (id, user_id, title, subject, description, due_date, priority, status, attachment_name, created_at)
SELECT 1, 1, 'B-Tree & Red-Black Tree Implementation', 'Data Structures & Algorithms', 'Implement self-balancing search trees in C++ with benchmark tests.', DATEADD('DAY', 1, CURRENT_TIMESTAMP), 'HIGH', 'IN_PROGRESS', 'ds_trees_spec.pdf', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM assignments WHERE id = 1);

INSERT INTO assignments (id, user_id, title, subject, description, due_date, priority, status, attachment_name, created_at)
SELECT 2, 1, 'Virtual Memory & Page Replacement Simulation', 'Operating Systems', 'Build LRU, FIFO, and Optimal page replacement simulator in Python.', DATEADD('DAY', 3, CURRENT_TIMESTAMP), 'HIGH', 'PENDING', 'os_lab_instructions.pdf', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM assignments WHERE id = 2);

INSERT INTO assignments (id, user_id, title, subject, description, due_date, priority, status, attachment_name, created_at)
SELECT 3, 1, 'E-Commerce Schema Design & Index Optimization', 'Database Management Systems', 'Design normalized relational schema (3NF) for bookstore with query plans.', DATEADD('DAY', 5, CURRENT_TIMESTAMP), 'MEDIUM', 'IN_PROGRESS', 'dbms_project_rubric.docx', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM assignments WHERE id = 3);

INSERT INTO assignments (id, user_id, title, subject, description, due_date, priority, status, attachment_name, created_at)
SELECT 4, 1, 'TCP Congestion Control Analysis (Cubic vs BBR)', 'Computer Networks', 'Analyze packet traces using Wireshark to measure throughput & loss.', DATEADD('DAY', 7, CURRENT_TIMESTAMP), 'LOW', 'PENDING', 'wireshark_traces.pcap', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM assignments WHERE id = 4);

INSERT INTO exams (id, user_id, subject, exam_title, exam_date, exam_time, venue, syllabus, preparation_status, priority, created_at)
SELECT 1, 1, 'Data Structures & Algorithms', 'Midterm Examination', DATEADD('DAY', 4, CURRENT_DATE), '09:30:00', 'Hall A - Engineering Quad, Room 302', 'Arrays, Linked Lists, Trees, Graph Traversals, Dynamic Programming.', 'IN_PROGRESS', 'HIGH', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM exams WHERE id = 1);

INSERT INTO exams (id, user_id, subject, exam_title, exam_date, exam_time, venue, syllabus, preparation_status, priority, created_at)
SELECT 2, 1, 'Operating Systems', 'Lab Practical & Theory Exam', DATEADD('DAY', 8, CURRENT_DATE), '14:00:00', 'Computer Systems Lab 2B', 'Processes, Threads, Semaphores, CPU Scheduling, Virtual Memory.', 'REVIEWING', 'HIGH', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM exams WHERE id = 2);

INSERT INTO reminders (id, user_id, title, message, reminder_date, is_read, reminder_type, reference_id, created_at)
SELECT 1, 1, 'Assignment Due Tomorrow!', 'Your B-Tree & Red-Black Tree implementation for Data Structures is due tomorrow at 11:59 PM.', DATEADD('DAY', 1, CURRENT_TIMESTAMP), FALSE, 'ASSIGNMENT', 1, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM reminders WHERE id = 1);
