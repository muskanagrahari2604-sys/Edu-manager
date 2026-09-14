# Student Assignment & Exam Manager

> A modern, responsive web application designed for college students to effortlessly track and manage assignments, examinations, course deadlines, and academic productivity.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Architecture & Communication](#architecture--communication)
4. [Technology Stack](#technology-stack)
5. [Project Structure](#project-structure)
6. [Database Schema & Setup (MySQL)](#database-schema--setup-mysql)
7. [Running the Backend (Spring Boot)](#running-the-backend-spring-boot)
   - [Running in IntelliJ IDEA](#running-in-intellij-idea)
   - [Running in VS Code](#running-in-vs-code)
   - [Running via Command Line / Terminal](#running-via-command-line--terminal)
8. [Running the Frontend](#running-the-frontend)
   - [Instant Offline / Demo Mode](#instant-offline--demo-mode)
   - [Connected Spring Boot REST Mode](#connected-spring-boot-rest-mode)
9. [Sample Login Credentials](#sample-login-credentials)
10. [REST API Endpoints Specification](#rest-api-endpoints-specification)

---

## Project Overview

**Student Assignment & Exam Manager** is built to solve academic clutter. Students can record upcoming assignments, track submission deadlines with relative countdown indicators, schedule midterms and final exams with venue and syllabus tracking, view an interactive monthly academic calendar, analyze personal productivity with charts, and receive automatic reminder alerts for impending deadlines.

---

## Key Features

- **Dashboard**:
  - Summary metric cards: Total assignments, Pending, Completed, Upcoming Exams.
  - Interactive SVG circular completion percentage meter.
  - Urgent alerts strip for assignments due within 24–48 hours or upcoming exams.
  - Today's tasks checklist with inline completion toggle.
  - Upcoming exams schedule with countdown badges (e.g. "In 4 days", "Tomorrow!").
  - Due soon assignments quick-review table.

- **Assignment Management**:
  - Full CRUD: Add, View, Edit, Delete, and Mark Complete assignments.
  - Fields: Title, Subject/Course, Due Date & Time, Priority (`Low`, `Medium`, `High`), Status (`Pending`, `In Progress`, `Completed`), Description, and Attachment file.
  - Dual Views: Switch between **Table View** and **Card/Grid View**.
  - Multi-filtering by Status, Priority, and Subject.
  - Sorting by: Nearest Deadline, Highest Priority, Newest, or Oldest.

- **Exam Management**:
  - Full CRUD: Schedule, Edit, Delete, and Track exams.
  - Fields: Subject, Exam Title/Type (Midterm, Final, Quiz, Lab Practical), Date, Time, Venue/Room, Syllabus & Key Topics, Preparation Status (`Not Started`, `In Progress`, `Reviewing`, `Well Prepared`), Priority.
  - Countdown indicators and expandable syllabus view.

- **Academic Calendar**:
  - Interactive monthly calendar with previous month, next month, and "Today" navigation.
  - Distinct visual badges for assignments (blue/indigo) and exams (amber/red).
  - Click any event pill to view and edit its details in a modal.

- **Productivity Analytics**:
  - Visual charts rendered with zero-dependency high-DPI HTML5 Canvas.
  - Assignment Status Donut Chart (Completed vs In Progress vs Pending).
  - Assignments by Subject Bar Chart.
  - Exam Preparation Readiness meters.
  - Study Workload Pressure Index based on next 14 days demands.

- **Automated Reminder Engine**:
  - Auto-generated alerts for overdue assignments, assignments due tomorrow, and exams scheduled within 7 days.
  - Custom reminder creation with specific dates and notes.
  - Unread badge counter in header and sidebar, with "Mark as Read" and "Mark All as Read".

- **Modern User Interface & Themes**:
  - Custom CSS Design System with Outfit, Plus Jakarta Sans, and JetBrains Mono typography.
  - One-click Light / Dark Mode toggle with automatic local storage persistence.
  - Fully responsive layout for desktop, tablet, and mobile with sliding drawer navigation.

---

## Architecture & Communication

```
┌────────────────────────────────────────────────────────┐
│             Frontend (HTML5, CSS3, JS ES6)             │
│   Dashboard | Assignments | Exams | Calendar | Charts  │
└───────────────────────────┬────────────────────────────┘
                            │
               HTTP REST JSON (Fetch API)
          Headers: Authorization: Bearer <token>
                            │
┌───────────────────────────▼────────────────────────────┐
│         Backend (Java 17+ / Spring Boot 3.2.x)          │
│  - SecurityConfig & AuthFilter (Token Validation)      │
│  - REST Controllers (@RestController)                  │
│  - Service Layer (User Isolation & Business Logic)      │
│  - Spring Data JPA Repositories                        │
└───────────────────────────┬────────────────────────────┘
                            │
                       JDBC Driver
                            │
┌───────────────────────────▼────────────────────────────┐
│                    MySQL Database                      │
│      users | assignments | exams | reminders           │
└────────────────────────────────────────────────────────┘
```

### Communication Flow:
1. **Frontend Request**: When a student loads the dashboard or creates an assignment, `frontend/js/api.js` dispatches an asynchronous `fetch()` call to `http://localhost:8080/api/...` with JSON payload and the student's Bearer token.
2. **Backend Authentication & Isolation**: Spring Boot's `AuthFilter` intercepts the request, verifies the user credentials, and sets the authenticated user in the thread context. All queries in `AssignmentRepository`, `ExamRepository`, and `ReminderRepository` filter strictly by `user_id`, guaranteeing multi-student privacy.
3. **Database Persistence**: Spring Data JPA executes SQL queries on MySQL and maps rows into relational entities.
4. **JSON Response**: Spring Boot controllers return typed DTOs formatted as JSON with HTTP status codes (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`).
5. **Dual-Mode Fallback**: If the Spring Boot backend is not currently running, the frontend intelligently falls back to an in-browser local storage mode populated with realistic university course data, so you can immediately interact with every feature!

---

## Technology Stack

### Frontend:
- **Structure**: Semantic HTML5 with accessibility tags and unique IDs.
- **Styling**: Vanilla CSS3 with CSS custom properties (variables), Flexbox, CSS Grid, Glassmorphism, and responsive breakpoints.
- **Logic**: Vanilla Modern JavaScript (ES6+ modular closures).
- **Icons & Typography**: Font Awesome 6, Google Fonts (`Outfit`, `Plus Jakarta Sans`, `JetBrains Mono`).

### Backend:
- **Language**: Java 17+ (tested and compatible with Java 21 / 26).
- **Framework**: Spring Boot 3.2.5.
- **Modules**:
  - `spring-boot-starter-web` (REST APIs & Jackson JSON serialization).
  - `spring-boot-starter-data-jpa` (Hibernate ORM & Spring Data).
  - `spring-boot-starter-security` (BCrypt password encoding and stateless authentication).
  - `spring-boot-starter-validation` (Bean validation constraints).
  - `mysql-connector-j` (MySQL 8.0+ JDBC driver).
  - `h2` (Optional in-memory driver for rapid zero-config local testing).

### Database:
- **RDBMS**: MySQL 8.0+ with InnoDB engine and UTF-8 Unicode encoding.

---

## Project Structure

```
c:\Users\Mukku\Desktop\Project\
├── frontend/
│   ├── index.html                  # Core single-page application
│   ├── css/
│   │   └── style.css               # Modern design system & dark/light theme tokens
│   └── js/
│       ├── api.js                  # REST API client with dual-mode fallback
│       ├── auth.js                 # Authentication, login, register & profile state
│       ├── sampleData.js           # Realistic dynamic college course data
│       ├── dashboard.js            # Dashboard metrics, progress ring & task list
│       ├── assignments.js          # Assignment CRUD, table & grid views, filters
│       ├── exams.js                # Exam management, countdown badges, syllabus
│       ├── calendar.js             # Interactive monthly academic calendar
│       ├── analytics.js            # HTML5 Canvas donut, bar & progress charts
│       ├── reminders.js            # Automated alert generator & custom reminders
│       └── app.js                  # Application coordinator, modals, toasts & theme
│
├── backend/
│   ├── pom.xml                     # Maven project configuration
│   ├── .mvn/wrapper/               # Maven wrapper settings
│   └── src/
│       └── main/
│           ├── java/com/student/manager/
│           │   ├── StudentManagerApplication.java
│           │   ├── config/
│           │   │   ├── CorsConfig.java
│           │   │   ├── SecurityConfig.java
│           │   │   ├── AuthFilter.java
│           │   │   ├── TokenProvider.java
│           │   │   └── UserContext.java
│           │   ├── controller/
│           │   │   ├── AuthController.java
│           │   │   ├── AssignmentController.java
│           │   │   ├── ExamController.java
│           │   │   ├── ReminderController.java
│           │   │   └── AnalyticsController.java
│           │   ├── dto/
│           │   │   ├── AuthRequest.java
│           │   │   ├── AuthResponse.java
│           │   │   ├── RegisterRequest.java
│           │   │   ├── UserProfileDto.java
│           │   │   ├── AssignmentDto.java
│           │   │   ├── ExamDto.java
│           │   │   ├── ReminderDto.java
│           │   │   ├── DashboardSummaryDto.java
│           │   │   └── AnalyticsDto.java
│           │   ├── entity/
│           │   │   ├── User.java
│           │   │   ├── Assignment.java
│           │   │   ├── Exam.java
│           │   │   ├── Reminder.java
│           │   │   ├── Priority.java
│           │   │   ├── AssignmentStatus.java
│           │   │   ├── PreparationStatus.java
│           │   │   └── ReminderType.java
│           │   ├── repository/
│           │   │   ├── UserRepository.java
│           │   │   ├── AssignmentRepository.java
│           │   │   ├── ExamRepository.java
│           │   │   └── ReminderRepository.java
│           │   └── service/
│           │       ├── AuthService.java
│           │       ├── AssignmentService.java
│           │       ├── ExamService.java
│           │       ├── ReminderService.java
│           │       └── AnalyticsService.java
│           └── resources/
│               ├── application.properties
│               ├── schema.sql
│               └── data.sql
│
├── database/
│   ├── schema.sql                  # MySQL database DDL table creation script
│   └── data.sql                    # Initial seed data for college student account
└── README.md
```

---

## Database Schema & Setup (MySQL)

### Step 1: Create Database and Run Schema
Open MySQL Command Line Client, MySQL Workbench, or phpMyAdmin:

```sql
SOURCE c:/Users/Mukku/Desktop/Project/database/schema.sql;
SOURCE c:/Users/Mukku/Desktop/Project/database/data.sql;
```

Or execute directly in terminal:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/data.sql
```

### Tables Overview:
1. `users`: Stores student ID, full name, email, BCrypt-hashed password, department, and semester.
2. `assignments`: Stores coursework title, subject, description, due date timestamp, priority (`LOW`, `MEDIUM`, `HIGH`), status (`PENDING`, `IN_PROGRESS`, `COMPLETED`), attachment file name, and foreign key to `users(id)`.
3. `exams`: Stores subject, exam title, date, time, venue, syllabus, preparation status (`NOT_STARTED`, `IN_PROGRESS`, `REVIEWING`, `WELL_PREPARED`), priority, and foreign key to `users(id)`.
4. `reminders`: Stores reminder title, detailed message, trigger date, read status (`is_read`), type (`ASSIGNMENT`, `EXAM`, `CUSTOM`), and reference ID.

---

## Running the Backend (Spring Boot)

### Configure MySQL Credentials
Open `backend/src/main/resources/application.properties` and update your MySQL username and password:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/student_manager_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

### Running in IntelliJ IDEA:
1. Launch IntelliJ IDEA.
2. Select **File -> Open...** and browse to `c:\Users\Mukku\Desktop\Project\backend`.
3. Select `pom.xml` and click **Open as Project**.
4. Allow IntelliJ to download dependencies.
5. In the Project pane, navigate to `src/main/java/com/student/manager/StudentManagerApplication.java`.
6. Right-click and select **Run 'StudentManagerApplication'** (or press `Shift + F10`).
7. The application will start at `http://localhost:8080`.

### Running in VS Code:
1. Open VS Code.
2. Select **File -> Open Folder...** and choose `c:\Users\Mukku\Desktop\Project`.
3. Ensure the **Extension Pack for Java** and **Spring Boot Extension Pack** are installed in VS Code.
4. Open `backend/src/main/java/com/student/manager/StudentManagerApplication.java`.
5. Click the **Run** button above `public static void main(String[] args)` (or press `F5`).
6. The terminal will display Spring Boot starting on port `8080`.

### Running via Command Line / Terminal:
```bash
cd backend
mvn spring-boot:run
```

---

## Running the Frontend

### Instant Offline / Demo Mode (No Setup Required):
Simply double-click or open `frontend/index.html` in **Google Chrome, Microsoft Edge, Firefox, or Safari**!
- The app automatically detects if Spring Boot is active or not.
- When offline, it loads realistic computer science coursework, upcoming exams, reminders, and calendar events directly in the browser.
- You can test full CRUD, search, filter, dark/light mode, and analytics without needing any command line tools or database setup!

### Connected Spring Boot REST Mode:
1. Start the Spring Boot backend (`http://localhost:8080`).
2. Serve or open `frontend/index.html`.
3. The indicator badge in the header will display **"REST API Connected"** in green.
4. All actions (adding assignments, toggling completion, scheduling exams) will communicate directly with your Spring Boot backend and persist to MySQL.

---

## Sample Login Credentials

| Role | Email | Password | Courses / Department |
| :--- | :--- | :--- | :--- |
| **Demo Student** | `alex.morgan@university.edu` | `student123` | Computer Science & Engineering (Data Structures, OS, DBMS, Networks, ML) |
| **Second Student** | `sarah.j@university.edu` | `student123` | Data Science & Analytics |

> [!TIP]
> You can also click **"Auto-fill Sample Student (Alex Morgan)"** in the login modal or register a brand new student account in seconds!

---

## REST API Endpoints Specification

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Public / Protected |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new student account | Public |
| `POST` | `/api/auth/login` | Log in and receive Bearer token | Public |
| `GET` | `/api/auth/profile` | Get current student's profile | Protected |
| `PUT` | `/api/auth/profile` | Update profile information | Protected |

### Assignments (`/api/assignments`)
| Method | Endpoint | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/assignments` | List assignments for authenticated student | `status`, `priority`, `subject`, `sortBy` |
| `GET` | `/api/assignments/{id}` | Get assignment details by ID | — |
| `POST` | `/api/assignments` | Create new assignment | JSON Body (`AssignmentDto`) |
| `PUT` | `/api/assignments/{id}` | Update existing assignment | JSON Body (`AssignmentDto`) |
| `PATCH` | `/api/assignments/{id}/toggle` | Toggle between Completed and Pending | — |
| `PATCH` | `/api/assignments/{id}/status` | Update status (`PENDING`, `IN_PROGRESS`, `COMPLETED`) | JSON `{ status: "..." }` |
| `DELETE`| `/api/assignments/{id}` | Delete assignment | — |

### Exams (`/api/exams`)
| Method | Endpoint | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/exams` | List all exams for student | `prepStatus`, `priority`, `sortBy` |
| `GET` | `/api/exams/upcoming` | List only upcoming exams from today onwards | — |
| `GET` | `/api/exams/{id}` | Get exam details | — |
| `POST` | `/api/exams` | Schedule a new exam | JSON Body (`ExamDto`) |
| `PUT` | `/api/exams/{id}` | Update exam details | JSON Body (`ExamDto`) |
| `DELETE`| `/api/exams/{id}` | Delete exam | — |

### Reminders & Notifications (`/api/reminders`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/reminders` | List all reminders (includes automated alerts) |
| `POST` | `/api/reminders` | Create custom study reminder |
| `PATCH` | `/api/reminders/{id}/read` | Mark a reminder as read |
| `POST` | `/api/reminders/mark-all-read` | Mark all unread reminders as read |
| `DELETE`| `/api/reminders/{id}` | Delete a reminder |

### Analytics & Dashboard (`/api/analytics`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/analytics/dashboard` | Dashboard metrics, due soon list, urgent alerts & today's tasks |
| `GET` | `/api/analytics/summary` | Productivity analytics, completion rates, subject & prep breakdowns |
