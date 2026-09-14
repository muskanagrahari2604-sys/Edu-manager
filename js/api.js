// ====================================================================
// API Client Layer: Student Assignment & Exam Manager
// Dual-Mode Support:
// 1. Spring Boot REST API mode (http://localhost:8080/api)
// 2. LocalStorage Demo mode (instant offline testing & fallback)
// ====================================================================

const API = (() => {
    let baseUrl = localStorage.getItem('sm_api_base_url') || 'http://localhost:8080/api';
    let isBackendActive = false;
    let forceDemoMode = localStorage.getItem('sm_force_demo') === 'true';

    // Storage Keys for In-Browser Demo Mode
    const KEYS = {
        TOKEN: 'sm_auth_token',
        CURRENT_USER: 'sm_current_user',
        ASSIGNMENTS: 'sm_assignments_data',
        EXAMS: 'sm_exams_data',
        REMINDERS: 'sm_reminders_data',
        USERS: 'sm_registered_users'
    };

    // Initialize Demo Data in localStorage if not present
    function initDemoStorage() {
        if (!localStorage.getItem(KEYS.ASSIGNMENTS)) {
            localStorage.setItem(KEYS.ASSIGNMENTS, JSON.stringify(SampleData.getDefaultAssignments()));
        }
        if (!localStorage.getItem(KEYS.EXAMS)) {
            localStorage.setItem(KEYS.EXAMS, JSON.stringify(SampleData.getDefaultExams()));
        }
        if (!localStorage.getItem(KEYS.REMINDERS)) {
            localStorage.setItem(KEYS.REMINDERS, JSON.stringify(SampleData.getDefaultReminders()));
        }
        if (!localStorage.getItem(KEYS.CURRENT_USER)) {
            localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(SampleData.defaultUser));
            localStorage.setItem(KEYS.TOKEN, 'demo-token-' + Date.now());
        }
        if (!localStorage.getItem(KEYS.USERS)) {
            const users = [
                {
                    id: 1,
                    name: "Alex Morgan",
                    email: "alex.morgan@university.edu",
                    password: "student123",
                    department: "Computer Science & Engineering",
                    semester: "Fall 2026"
                }
            ];
            localStorage.setItem(KEYS.USERS, JSON.stringify(users));
        }
    }

    initDemoStorage();

    function resetDemoData() {
        localStorage.setItem(KEYS.ASSIGNMENTS, JSON.stringify(SampleData.getDefaultAssignments()));
        localStorage.setItem(KEYS.EXAMS, JSON.stringify(SampleData.getDefaultExams()));
        localStorage.setItem(KEYS.REMINDERS, JSON.stringify(SampleData.getDefaultReminders()));
        localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(SampleData.defaultUser));
        localStorage.setItem(KEYS.TOKEN, 'demo-token-' + Date.now());
        return true;
    }

    // Token Helpers
    function getToken() {
        return localStorage.getItem(KEYS.TOKEN);
    }
    function setToken(token) {
        if (token) localStorage.setItem(KEYS.TOKEN, token);
        else localStorage.removeItem(KEYS.TOKEN);
    }
    function getCurrentUser() {
        const u = localStorage.getItem(KEYS.CURRENT_USER);
        return u ? JSON.parse(u) : null;
    }
    function setCurrentUser(user) {
        if (user) localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
        else localStorage.removeItem(KEYS.CURRENT_USER);
    }

    // Backend Connectivity Check
    async function checkBackendConnection() {
        if (forceDemoMode) {
            isBackendActive = false;
            return false;
        }
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1800);
            const res = await fetch(`${baseUrl}/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${getToken() || ''}`
                },
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            // If we get any HTTP status (even 401/403), the backend server is running!
            isBackendActive = true;
            return true;
        } catch (e) {
            isBackendActive = false;
            return false;
        }
    }

    function isConnectedToBackend() {
        return isBackendActive && !forceDemoMode;
    }

    function setForceDemoMode(val) {
        forceDemoMode = val;
        localStorage.setItem('sm_force_demo', val ? 'true' : 'false');
    }

    function setBaseUrl(url) {
        baseUrl = url.replace(/\/+$/, '');
        localStorage.setItem('sm_api_base_url', baseUrl);
    }

    function getBaseUrl() {
        return baseUrl;
    }

    // HTTP Request Helper
    async function request(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };
        const token = getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const user = getCurrentUser();
        if (user && user.email) {
            headers['X-User-Email'] = user.email;
        }

        const res = await fetch(`${baseUrl}${endpoint}`, {
            ...options,
            headers
        });

        if (!res.ok) {
            let errorMsg = `Server error (${res.status})`;
            try {
                const errData = await res.json();
                if (errData.error) errorMsg = errData.error;
                else if (errData.message) errorMsg = errData.message;
            } catch (_) {}
            throw new Error(errorMsg);
        }

        if (res.status === 204) return null;
        return await res.json();
    }

    // ----------------------------------------------------------------
    // DEMO / LOCAL STORAGE SIMULATION ENGINE
    // ----------------------------------------------------------------
    function getStoredList(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }
    function setStoredList(key, items) {
        localStorage.setItem(key, JSON.stringify(items));
    }

    // ================================================================
    // AUTHENTICATION APIS
    // ================================================================
    const auth = {
        async register(userData) {
            if (isConnectedToBackend()) {
                const res = await request('/auth/register', {
                    method: 'POST',
                    body: JSON.stringify(userData)
                });
                setToken(res.token);
                setCurrentUser(res.user);
                return res;
            }
            // Demo Mode Registration
            const users = getStoredList(KEYS.USERS);
            const email = userData.email.toLowerCase().trim();
            if (users.some(u => u.email === email)) {
                throw new Error("An account with this email already exists.");
            }
            const newUser = {
                id: Date.now(),
                name: userData.name.trim(),
                email: email,
                password: userData.password,
                department: userData.department || "Computer Science & Engineering",
                semester: userData.semester || "Fall 2026",
                avatarUrl: ""
            };
            users.push(newUser);
            setStoredList(KEYS.USERS, users);

            const token = 'demo-token-' + Date.now();
            setToken(token);
            setCurrentUser(newUser);
            return {
                token,
                message: "Registration successful!",
                user: newUser
            };
        },

        async login(email, password) {
            if (isConnectedToBackend()) {
                const res = await request('/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({ email, password })
                });
                setToken(res.token);
                setCurrentUser(res.user);
                return res;
            }
            // Demo Mode Login
            const users = getStoredList(KEYS.USERS);
            const cleanEmail = email.toLowerCase().trim();
            const user = users.find(u => u.email === cleanEmail);
            if (!user || user.password !== password) {
                // Allow login if email is alex.morgan@university.edu with student123 or any test student
                if (cleanEmail === "alex.morgan@university.edu" && password === "student123") {
                    const demoUser = SampleData.defaultUser;
                    const token = 'demo-token-' + Date.now();
                    setToken(token);
                    setCurrentUser(demoUser);
                    return { token, message: "Login successful!", user: demoUser };
                }
                throw new Error("Invalid email or password.");
            }
            const token = 'demo-token-' + Date.now();
            setToken(token);
            setCurrentUser(user);
            return { token, message: "Login successful!", user };
        },

        async getProfile() {
            if (isConnectedToBackend()) {
                const user = await request('/auth/profile');
                setCurrentUser(user);
                return user;
            }
            return getCurrentUser() || SampleData.defaultUser;
        },

        async updateProfile(profileData) {
            if (isConnectedToBackend()) {
                const user = await request('/auth/profile', {
                    method: 'PUT',
                    body: JSON.stringify(profileData)
                });
                setCurrentUser(user);
                return user;
            }
            const currentUser = getCurrentUser() || SampleData.defaultUser;
            const updated = { ...currentUser, ...profileData };
            setCurrentUser(updated);

            // Update in users list
            const users = getStoredList(KEYS.USERS);
            const idx = users.findIndex(u => u.id === updated.id);
            if (idx >= 0) {
                users[idx] = { ...users[idx], ...updated };
                setStoredList(KEYS.USERS, users);
            }
            return updated;
        },

        logout() {
            setToken(null);
            setCurrentUser(null);
        }
    };

    // ================================================================
    // ASSIGNMENT APIS
    // ================================================================
    const assignments = {
        async getAll(filters = {}) {
            if (isConnectedToBackend()) {
                const params = new URLSearchParams();
                if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
                if (filters.priority && filters.priority !== 'ALL') params.append('priority', filters.priority);
                if (filters.subject && filters.subject !== 'ALL') params.append('subject', filters.subject);
                if (filters.sortBy) params.append('sortBy', filters.sortBy);
                return await request(`/assignments?${params.toString()}`);
            }

            // Demo Mode
            let list = getStoredList(KEYS.ASSIGNMENTS);
            if (filters.status && filters.status !== 'ALL') {
                list = list.filter(a => a.status === filters.status);
            }
            if (filters.priority && filters.priority !== 'ALL') {
                list = list.filter(a => a.priority === filters.priority);
            }
            if (filters.subject && filters.subject !== 'ALL') {
                list = list.filter(a => a.subject.toLowerCase() === filters.subject.toLowerCase());
            }
            if (filters.search) {
                const s = filters.search.toLowerCase();
                list = list.filter(a => a.title.toLowerCase().includes(s) || (a.description && a.description.toLowerCase().includes(s)));
            }

            const priorityWeight = { HIGH: 3, MEDIUM: 2, LOW: 1 };
            list.sort((a, b) => {
                if (filters.sortBy === 'newest') {
                    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                } else if (filters.sortBy === 'oldest') {
                    return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
                } else if (filters.sortBy === 'priority') {
                    return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
                } else {
                    return new Date(a.dueDate) - new Date(b.dueDate);
                }
            });
            return list;
        },

        async getById(id) {
            if (isConnectedToBackend()) {
                return await request(`/assignments/${id}`);
            }
            const list = getStoredList(KEYS.ASSIGNMENTS);
            const found = list.find(a => a.id == id);
            if (!found) throw new Error("Assignment not found");
            return found;
        },

        async create(data) {
            if (isConnectedToBackend()) {
                return await request('/assignments', {
                    method: 'POST',
                    body: JSON.stringify(data)
                });
            }
            const list = getStoredList(KEYS.ASSIGNMENTS);
            const newAssignment = {
                id: Date.now(),
                title: data.title.trim(),
                subject: data.subject.trim(),
                description: data.description || '',
                dueDate: data.dueDate,
                priority: data.priority || 'MEDIUM',
                status: data.status || 'PENDING',
                attachmentName: data.attachmentName || null,
                createdAt: new Date().toISOString()
            };
            list.push(newAssignment);
            setStoredList(KEYS.ASSIGNMENTS, list);
            return newAssignment;
        },

        async update(id, data) {
            if (isConnectedToBackend()) {
                return await request(`/assignments/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(data)
                });
            }
            const list = getStoredList(KEYS.ASSIGNMENTS);
            const idx = list.findIndex(a => a.id == id);
            if (idx === -1) throw new Error("Assignment not found");
            list[idx] = { ...list[idx], ...data, id: Number(id), updatedAt: new Date().toISOString() };
            setStoredList(KEYS.ASSIGNMENTS, list);
            return list[idx];
        },

        async toggleComplete(id) {
            if (isConnectedToBackend()) {
                return await request(`/assignments/${id}/toggle`, { method: 'PATCH' });
            }
            const list = getStoredList(KEYS.ASSIGNMENTS);
            const item = list.find(a => a.id == id);
            if (!item) throw new Error("Assignment not found");
            item.status = item.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
            item.updatedAt = new Date().toISOString();
            setStoredList(KEYS.ASSIGNMENTS, list);
            return item;
        },

        async updateStatus(id, status) {
            if (isConnectedToBackend()) {
                return await request(`/assignments/${id}/status`, {
                    method: 'PATCH',
                    body: JSON.stringify({ status })
                });
            }
            const list = getStoredList(KEYS.ASSIGNMENTS);
            const item = list.find(a => a.id == id);
            if (!item) throw new Error("Assignment not found");
            item.status = status;
            item.updatedAt = new Date().toISOString();
            setStoredList(KEYS.ASSIGNMENTS, list);
            return item;
        },

        async delete(id) {
            if (isConnectedToBackend()) {
                return await request(`/assignments/${id}`, { method: 'DELETE' });
            }
            let list = getStoredList(KEYS.ASSIGNMENTS);
            list = list.filter(a => a.id != id);
            setStoredList(KEYS.ASSIGNMENTS, list);
            return { message: "Assignment deleted" };
        }
    };

    // ================================================================
    // EXAM APIS
    // ================================================================
    const exams = {
        async getAll(filters = {}) {
            if (isConnectedToBackend()) {
                const params = new URLSearchParams();
                if (filters.prepStatus && filters.prepStatus !== 'ALL') params.append('prepStatus', filters.prepStatus);
                if (filters.priority && filters.priority !== 'ALL') params.append('priority', filters.priority);
                if (filters.sortBy) params.append('sortBy', filters.sortBy);
                return await request(`/exams?${params.toString()}`);
            }

            // Demo Mode
            let list = getStoredList(KEYS.EXAMS);
            if (filters.prepStatus && filters.prepStatus !== 'ALL') {
                list = list.filter(e => e.preparationStatus === filters.prepStatus);
            }
            if (filters.priority && filters.priority !== 'ALL') {
                list = list.filter(e => e.priority === filters.priority);
            }
            if (filters.search) {
                const s = filters.search.toLowerCase();
                list = list.filter(e => e.subject.toLowerCase().includes(s) || e.examTitle.toLowerCase().includes(s) || (e.venue && e.venue.toLowerCase().includes(s)));
            }

            const priorityWeight = { HIGH: 3, MEDIUM: 2, LOW: 1 };
            list.sort((a, b) => {
                if (filters.sortBy === 'newest') {
                    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                } else if (filters.sortBy === 'priority') {
                    return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
                } else {
                    return new Date(a.examDate + 'T' + (a.examTime || '00:00')) - new Date(b.examDate + 'T' + (b.examTime || '00:00'));
                }
            });
            return list;
        },

        async getUpcoming() {
            if (isConnectedToBackend()) {
                return await request('/exams/upcoming');
            }
            const list = getStoredList(KEYS.EXAMS);
            const today = new Date().toISOString().split('T')[0];
            return list.filter(e => e.examDate >= today).sort((a, b) => new Date(a.examDate) - new Date(b.examDate));
        },

        async getById(id) {
            if (isConnectedToBackend()) {
                return await request(`/exams/${id}`);
            }
            const list = getStoredList(KEYS.EXAMS);
            const found = list.find(e => e.id == id);
            if (!found) throw new Error("Exam not found");
            return found;
        },

        async create(data) {
            if (isConnectedToBackend()) {
                return await request('/exams', {
                    method: 'POST',
                    body: JSON.stringify(data)
                });
            }
            const list = getStoredList(KEYS.EXAMS);
            const newExam = {
                id: Date.now(),
                subject: data.subject.trim(),
                examTitle: data.examTitle.trim(),
                examDate: data.examDate,
                examTime: data.examTime || '09:00',
                venue: data.venue ? data.venue.trim() : 'Main Academic Hall',
                syllabus: data.syllabus || '',
                preparationStatus: data.preparationStatus || 'NOT_STARTED',
                priority: data.priority || 'HIGH',
                createdAt: new Date().toISOString()
            };
            list.push(newExam);
            setStoredList(KEYS.EXAMS, list);
            return newExam;
        },

        async update(id, data) {
            if (isConnectedToBackend()) {
                return await request(`/exams/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(data)
                });
            }
            const list = getStoredList(KEYS.EXAMS);
            const idx = list.findIndex(e => e.id == id);
            if (idx === -1) throw new Error("Exam not found");
            list[idx] = { ...list[idx], ...data, id: Number(id), updatedAt: new Date().toISOString() };
            setStoredList(KEYS.EXAMS, list);
            return list[idx];
        },

        async delete(id) {
            if (isConnectedToBackend()) {
                return await request(`/exams/${id}`, { method: 'DELETE' });
            }
            let list = getStoredList(KEYS.EXAMS);
            list = list.filter(e => e.id != id);
            setStoredList(KEYS.EXAMS, list);
            return { message: "Exam deleted" };
        }
    };

    // ================================================================
    // REMINDER APIS
    // ================================================================
    const reminders = {
        async getAll() {
            if (isConnectedToBackend()) {
                return await request('/reminders');
            }
            return getStoredList(KEYS.REMINDERS).sort((a, b) => new Date(b.reminderDate) - new Date(a.reminderDate));
        },

        async create(data) {
            if (isConnectedToBackend()) {
                return await request('/reminders', {
                    method: 'POST',
                    body: JSON.stringify(data)
                });
            }
            const list = getStoredList(KEYS.REMINDERS);
            const newReminder = {
                id: Date.now(),
                title: data.title.trim(),
                message: data.message.trim(),
                reminderDate: data.reminderDate || new Date().toISOString(),
                isRead: false,
                reminderType: data.reminderType || 'CUSTOM',
                referenceId: data.referenceId || null,
                createdAt: new Date().toISOString()
            };
            list.unshift(newReminder);
            setStoredList(KEYS.REMINDERS, list);
            return newReminder;
        },

        async markRead(id) {
            if (isConnectedToBackend()) {
                return await request(`/reminders/${id}/read`, { method: 'PATCH' });
            }
            const list = getStoredList(KEYS.REMINDERS);
            const item = list.find(r => r.id == id);
            if (item) {
                item.isRead = true;
                setStoredList(KEYS.REMINDERS, list);
            }
            return item;
        },

        async markAllRead() {
            if (isConnectedToBackend()) {
                return await request('/reminders/mark-all-read', { method: 'POST' });
            }
            const list = getStoredList(KEYS.REMINDERS);
            list.forEach(r => r.isRead = true);
            setStoredList(KEYS.REMINDERS, list);
            return { message: "All reminders marked as read" };
        },

        async delete(id) {
            if (isConnectedToBackend()) {
                return await request(`/reminders/${id}`, { method: 'DELETE' });
            }
            let list = getStoredList(KEYS.REMINDERS);
            list = list.filter(r => r.id != id);
            setStoredList(KEYS.REMINDERS, list);
            return { message: "Reminder deleted" };
        }
    };

    // ================================================================
    // ANALYTICS & DASHBOARD APIS
    // ================================================================
    const analytics = {
        async getDashboard() {
            if (isConnectedToBackend()) {
                return await request('/analytics/dashboard');
            }

            // Demo Mode dashboard calculation
            const assignmentsList = getStoredList(KEYS.ASSIGNMENTS);
            const examsList = getStoredList(KEYS.EXAMS);
            const remindersList = getStoredList(KEYS.REMINDERS);

            const totalAssignments = assignmentsList.length;
            const completed = assignmentsList.filter(a => a.status === 'COMPLETED').length;
            const inProgress = assignmentsList.filter(a => a.status === 'IN_PROGRESS').length;
            const pending = assignmentsList.filter(a => a.status === 'PENDING').length;
            const completionPercentage = totalAssignments > 0
                ? Math.round((completed / totalAssignments) * 100 * 10) / 10
                : 0;

            const now = new Date();
            const in72h = new Date(now.getTime() + 72 * 3600 * 1000);
            const todayStr = now.toISOString().split('T')[0];

            const dueSoonAssignments = assignmentsList.filter(a => {
                if (a.status === 'COMPLETED') return false;
                const d = new Date(a.dueDate);
                return d <= in72h;
            }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

            const todayTasks = assignmentsList.filter(a => {
                return a.dueDate.startsWith(todayStr);
            });

            const upcomingExams = examsList
                .filter(e => e.examDate >= todayStr)
                .sort((a, b) => new Date(a.examDate) - new Date(b.examDate));

            const urgentReminders = remindersList
                .filter(r => !r.isRead)
                .slice(0, 5);

            const assignmentsBySubject = {};
            assignmentsList.forEach(a => {
                assignmentsBySubject[a.subject] = (assignmentsBySubject[a.subject] || 0) + 1;
            });

            const examsByPrepStatus = {};
            examsList.forEach(e => {
                examsByPrepStatus[e.preparationStatus] = (examsByPrepStatus[e.preparationStatus] || 0) + 1;
            });

            return {
                totalAssignments,
                pendingAssignments: pending,
                inProgressAssignments: inProgress,
                completedAssignments: completed,
                upcomingExamsCount: upcomingExams.length,
                completionPercentage,
                unreadRemindersCount: remindersList.filter(r => !r.isRead).length,
                dueSoonAssignments,
                todayTasks,
                upcomingExams: upcomingExams.slice(0, 5),
                urgentReminders,
                assignmentsBySubject,
                examsByPrepStatus
            };
        },

        async getSummary() {
            if (isConnectedToBackend()) {
                return await request('/analytics/summary');
            }

            const assignmentsList = getStoredList(KEYS.ASSIGNMENTS);
            const examsList = getStoredList(KEYS.EXAMS);
            const todayStr = new Date().toISOString().split('T')[0];

            const total = assignmentsList.length;
            const completed = assignmentsList.filter(a => a.status === 'COMPLETED').length;
            const inProgress = assignmentsList.filter(a => a.status === 'IN_PROGRESS').length;
            const pending = assignmentsList.filter(a => a.status === 'PENDING').length;
            const completionRate = total > 0 ? Math.round((completed / total) * 100 * 10) / 10 : 0;

            const subjectBreakdown = {};
            const priorityBreakdown = {};
            assignmentsList.forEach(a => {
                subjectBreakdown[a.subject] = (subjectBreakdown[a.subject] || 0) + 1;
                priorityBreakdown[a.priority] = (priorityBreakdown[a.priority] || 0) + 1;
            });

            const examStatusBreakdown = {};
            examsList.forEach(e => {
                examStatusBreakdown[e.preparationStatus] = (examStatusBreakdown[e.preparationStatus] || 0) + 1;
            });

            const upcomingExams = examsList.filter(e => e.examDate >= todayStr).length;

            return {
                totalAssignments: total,
                completedAssignments: completed,
                inProgressAssignments: inProgress,
                pendingAssignments: pending,
                completionRate,
                totalExams: examsList.length,
                upcomingExams,
                subjectBreakdown,
                priorityBreakdown,
                examStatusBreakdown,
                monthlyCompletion: {
                    "Sep 2026": completed,
                    "Aug 2026": 4,
                    "Jul 2026": 2
                }
            };
        }
    };

    return {
        checkBackendConnection,
        isConnectedToBackend,
        setForceDemoMode,
        setBaseUrl,
        getBaseUrl,
        resetDemoData,
        auth,
        assignments,
        exams,
        reminders,
        analytics
    };
})();
