// ====================================================================
// Sample Data Module for Student Assignment & Exam Manager
// Dynamically generates realistic college data relative to current date
// ====================================================================

const SampleData = (() => {
    function getOffsetDate(daysOffset, hours = 23, minutes = 59) {
        const d = new Date();
        d.setDate(d.getDate() + daysOffset);
        d.setHours(hours, minutes, 0, 0);
        return d.toISOString();
    }

    function getOffsetDateOnly(daysOffset) {
        const d = new Date();
        d.setDate(d.getDate() + daysOffset);
        return d.toISOString().split('T')[0];
    }

    const defaultUser = {
        id: 1,
        name: "Alex Morgan",
        email: "alex.morgan@university.edu",
        department: "Computer Science & Engineering",
        semester: "Fall 2026",
        avatarUrl: ""
    };

    function getDefaultAssignments() {
        return [
            {
                id: 1,
                title: "B-Tree & Red-Black Tree Implementation",
                subject: "Data Structures & Algorithms",
                description: "Implement self-balancing search trees in C++ with benchmark test cases for insertion, deletion, and inorder traversal.",
                dueDate: getOffsetDate(1, 23, 59),
                priority: "HIGH",
                status: "IN_PROGRESS",
                attachmentName: "ds_trees_spec.pdf",
                createdAt: getOffsetDate(-4, 10, 0)
            },
            {
                id: 2,
                title: "Virtual Memory & Page Replacement Simulation",
                subject: "Operating Systems",
                description: "Build an LRU, FIFO, and Optimal page replacement simulator in Python with a comprehensive report comparing fault rates.",
                dueDate: getOffsetDate(3, 17, 0),
                priority: "HIGH",
                status: "PENDING",
                attachmentName: "os_lab_instructions.pdf",
                createdAt: getOffsetDate(-3, 14, 30)
            },
            {
                id: 3,
                title: "E-Commerce Schema Design & Index Optimization",
                subject: "Database Management Systems",
                description: "Design normalized relational schema (3NF) for high-concurrency bookstore. Include complex queries and EXPLAIN query plan analysis.",
                dueDate: getOffsetDate(5, 23, 59),
                priority: "MEDIUM",
                status: "IN_PROGRESS",
                attachmentName: "dbms_project_rubric.docx",
                createdAt: getOffsetDate(-2, 11, 15)
            },
            {
                id: 4,
                title: "TCP Congestion Control Analysis (Cubic vs BBR)",
                subject: "Computer Networks",
                description: "Analyze packet capture traces using Wireshark to measure throughput, packet loss, and RTT variance across different congestion algorithms.",
                dueDate: getOffsetDate(7, 20, 0),
                priority: "LOW",
                status: "PENDING",
                attachmentName: "wireshark_traces.pcap",
                createdAt: getOffsetDate(-1, 9, 0)
            },
            {
                id: 5,
                title: "Convolutional Neural Network for Digit Recognition",
                subject: "Machine Learning",
                description: "Train a CNN model on MNIST / CIFAR-10 with data augmentation, dropout regularization, and plot validation loss curves.",
                dueDate: getOffsetDate(-2, 23, 59),
                priority: "HIGH",
                status: "COMPLETED",
                attachmentName: "cnn_final_notebook.ipynb",
                createdAt: getOffsetDate(-8, 16, 0)
            },
            {
                id: 6,
                title: "Software Architecture Pattern Case Study",
                subject: "Software Engineering",
                description: "Write a 6-page research report evaluating microservices vs event-driven architectural patterns for modern banking platforms.",
                dueDate: getOffsetDate(-5, 18, 0),
                priority: "MEDIUM",
                status: "COMPLETED",
                attachmentName: "software_arch_paper.pdf",
                createdAt: getOffsetDate(-10, 12, 0)
            },
            {
                id: 7,
                title: "Grammar Analysis & LL(1) Parser Implementation",
                subject: "Compiler Design",
                description: "Eliminate left recursion, compute FIRST and FOLLOW sets, and implement a predictive parsing table generator.",
                dueDate: getOffsetDate(10, 23, 59),
                priority: "MEDIUM",
                status: "PENDING",
                attachmentName: "compiler_lab3_spec.pdf",
                createdAt: getOffsetDate(-2, 18, 0)
            }
        ];
    }

    function getDefaultExams() {
        return [
            {
                id: 1,
                subject: "Data Structures & Algorithms",
                examTitle: "Midterm Examination",
                examDate: getOffsetDateOnly(4),
                examTime: "09:30",
                venue: "Hall A - Engineering Quad, Room 302",
                syllabus: "Arrays, Linked Lists, Stacks, Queues, Binary Heaps, AVL Trees, Graph Traversals (BFS/DFS), Dynamic Programming fundamentals.",
                preparationStatus: "IN_PROGRESS",
                priority: "HIGH",
                createdAt: getOffsetDate(-5, 9, 0)
            },
            {
                id: 2,
                subject: "Operating Systems",
                examTitle: "Lab Practical & Theory Exam",
                examDate: getOffsetDateOnly(8),
                examTime: "14:00",
                venue: "Computer Systems Lab 2B",
                syllabus: "Process Management, Threads, POSIX Semaphores, Deadlock detection algorithms, CPU Scheduling, Virtual Memory architecture.",
                preparationStatus: "REVIEWING",
                priority: "HIGH",
                createdAt: getOffsetDate(-4, 11, 0)
            },
            {
                id: 3,
                subject: "Database Management Systems",
                examTitle: "Periodic Quiz & Query Challenge",
                examDate: getOffsetDateOnly(12),
                examTime: "11:00",
                venue: "Science Building - Aud 101",
                syllabus: "Relational Algebra, SQL Subqueries, Aggregations, B+ Trees indexing, Transaction ACID properties, Two-Phase Locking.",
                preparationStatus: "NOT_STARTED",
                priority: "MEDIUM",
                createdAt: getOffsetDate(-3, 15, 0)
            },
            {
                id: 4,
                subject: "Computer Networks",
                examTitle: "Final Comprehensive Exam",
                examDate: getOffsetDateOnly(20),
                examTime: "10:00",
                venue: "Main Campus Auditorium",
                syllabus: "OSI 7-Layer & TCP/IP stack, DNS, HTTP/3, Reliable Data Transfer protocols, BGP routing, Cryptographic security principles.",
                preparationStatus: "NOT_STARTED",
                priority: "HIGH",
                createdAt: getOffsetDate(-2, 16, 0)
            }
        ];
    }

    function getDefaultReminders() {
        return [
            {
                id: 1,
                title: "Assignment Due Tomorrow!",
                message: "Your B-Tree & Red-Black Tree implementation for Data Structures is due tomorrow at 11:59 PM. Run benchmarks and submit before the deadline!",
                reminderDate: getOffsetDate(1, 12, 0),
                isRead: false,
                reminderType: "ASSIGNMENT",
                referenceId: 1,
                createdAt: getOffsetDate(0, 8, 0)
            },
            {
                id: 2,
                title: "Upcoming Midterm Exam",
                message: "Data Structures & Algorithms Midterm Exam is in 4 days at Hall A Room 302. Don't forget your university ID card and calculator.",
                reminderDate: getOffsetDate(4, 9, 0),
                isRead: false,
                reminderType: "EXAM",
                referenceId: 1,
                createdAt: getOffsetDate(0, 9, 0)
            },
            {
                id: 3,
                title: "OS Lab Simulator Deadline Approaching",
                message: "Virtual Memory & Page Replacement simulator is due in 3 days. Verify that your LRU & FIFO hit/miss charts are included.",
                reminderDate: getOffsetDate(3, 12, 0),
                isRead: false,
                reminderType: "ASSIGNMENT",
                referenceId: 2,
                createdAt: getOffsetDate(0, 10, 0)
            },
            {
                id: 4,
                title: "Group Study Session",
                message: "Library Room 405 study session on Dynamic Programming with study group at 6:00 PM today.",
                reminderDate: getOffsetDate(0, 18, 0),
                isRead: true,
                reminderType: "CUSTOM",
                referenceId: null,
                createdAt: getOffsetDate(-1, 14, 0)
            }
        ];
    }

    return {
        defaultUser,
        getDefaultAssignments,
        getDefaultExams,
        getDefaultReminders
    };
})();
