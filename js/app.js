// ====================================================================
// Core Application Controller: Navigation, Modals, Theme & Toasts
// ====================================================================

const App = (() => {
    let currentView = 'dashboard';

    function init() {
        initTheme();
        initNavigation();
        initModals();
        initQuickActionMenu();
        initBackendStatusCheck();
        initSettingsHandlers();
        initNotificationBell();
        initMobileFAB();
        initKeyboardShortcuts();

        // Initialize submodules
        AuthManager.init();
        AssignmentsManager.init();
        ExamsManager.init();
        CalendarManager.init();
        RemindersManager.init();
        GradesManager.init();

        // Load initial view
        navigateTo('dashboard');
    }

    // ================================================================
    // Theme Management (Light / Dark)
    // ================================================================
    function initTheme() {
        const savedTheme = localStorage.getItem('sm_theme') || 'dark';
        setTheme(savedTheme);

        document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const current = document.documentElement.getAttribute('data-theme') || 'dark';
                setTheme(current === 'dark' ? 'light' : 'dark');
            });
        });
    }

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('sm_theme', theme);

        document.querySelectorAll('.theme-icon').forEach(icon => {
            icon.className = theme === 'dark' ? 'fas fa-sun theme-icon' : 'fas fa-moon theme-icon';
        });

        // Re-render canvas charts if on analytics view
        if (currentView === 'analytics') {
            setTimeout(() => AnalyticsManager.loadAnalytics(), 100);
        }
    }

    // ================================================================
    // View Navigation & Routing
    // ================================================================
    function initNavigation() {
        document.querySelectorAll('.nav-item[data-view]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                navigateTo(link.dataset.view);
                closeMobileSidebar();
            });
        });

        // Mobile menu toggle
        const mobileBtn = document.getElementById('mobile-menu-toggle');
        const sidebar = document.getElementById('main-sidebar');
        const overlay = document.getElementById('sidebar-overlay');

        if (mobileBtn && sidebar) {
            mobileBtn.addEventListener('click', () => {
                sidebar.classList.toggle('mobile-open');
                if (overlay) overlay.classList.toggle('active');
            });
        }

        if (overlay) {
            overlay.addEventListener('click', closeMobileSidebar);
        }

        // Global search (Enter key sends to assignments search)
        const globalSearch = document.getElementById('global-search-input');
        if (globalSearch) {
            globalSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const query = globalSearch.value.trim();
                    if (query) {
                        navigateTo('assignments');
                        setTimeout(() => {
                            const assignSearch = document.getElementById('assign-search-input');
                            if (assignSearch) {
                                assignSearch.value = query;
                                assignSearch.dispatchEvent(new Event('input'));
                            }
                        }, 100);
                    }
                }
            });
        }
    }

    function closeMobileSidebar() {
        const sidebar = document.getElementById('main-sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        if (sidebar) sidebar.classList.remove('mobile-open');
        if (overlay) overlay.classList.remove('active');
    }

    function navigateTo(viewName) {
        currentView = viewName;

        // Update nav active state
        document.querySelectorAll('.nav-item[data-view]').forEach(link => {
            link.classList.toggle('active', link.dataset.view === viewName);
        });

        // Show/hide sections
        document.querySelectorAll('.view-section').forEach(sec => {
            sec.classList.toggle('active', sec.id === `view-${viewName}`);
        });

        // Update header text
        const titles = {
            dashboard:   { title: 'Dashboard Overview',              desc: 'Track your coursework, upcoming exams, deadlines, and workload' },
            assignments: { title: 'Assignment Manager',              desc: 'Organize, filter, and track deadlines for all course assignments' },
            exams:       { title: 'Exam Schedule',                   desc: 'Manage upcoming midterms, quizzes, and track syllabus preparation' },
            calendar:    { title: 'Academic Calendar',               desc: 'Visual timeline of all upcoming assignment due dates and exams' },
            analytics:   { title: 'Productivity Analytics',          desc: 'Visual statistics on task completion rate, workload & subjects' },
            reminders:   { title: 'Notifications & Reminders',       desc: 'Automated alerts for deadlines, exams, and custom notes' },
            grades:      { title: 'Grades & GPA Tracker',            desc: 'Monitor course grades, cumulative GPA, and grade point averages' },
            settings:    { title: 'Settings & Profile',              desc: 'Student details, theme preferences, and backend connection options' }
        };

        if (titles[viewName]) {
            const titleEl = document.getElementById('header-view-title');
            const descEl  = document.getElementById('header-view-desc');
            if (titleEl) titleEl.textContent = titles[viewName].title;
            if (descEl)  descEl.textContent  = titles[viewName].desc;
        }

        refreshCurrentView();
    }

    function refreshCurrentView() {
        switch (currentView) {
            case 'dashboard':   DashboardManager.loadDashboard();     break;
            case 'assignments': AssignmentsManager.loadAssignments(); break;
            case 'exams':       ExamsManager.loadExams();             break;
            case 'calendar':    CalendarManager.loadCalendar();       break;
            case 'analytics':   AnalyticsManager.loadAnalytics();     break;
            case 'reminders':   RemindersManager.loadReminders();     break;
            case 'grades':      GradesManager.loadGrades();           break;
            case 'settings':    AuthManager.renderUserProfile();      break;
        }
    }

    // ================================================================
    // Modal Manager
    // ================================================================
    function initModals() {
        // Close button handler
        document.querySelectorAll('.modal-close-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const overlay = btn.closest('.modal-overlay');
                if (overlay) overlay.classList.remove('active');
            });
        });

        // Click outside modal to close
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) overlay.classList.remove('active');
            });
        });

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const active = document.querySelector('.modal-overlay.active');
                if (active) active.classList.remove('active');
                closeAllDropdowns();
            }
        });
    }

    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.add('active');
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('active');
    }

    // ================================================================
    // Quick Action Dropdown (+New button)
    // ================================================================
    function initQuickActionMenu() {
        const trigger = document.getElementById('quick-action-btn');
        const menu    = document.getElementById('quick-action-menu');

        if (trigger && menu) {
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                menu.classList.toggle('active');
            });
        }

        document.addEventListener('click', closeAllDropdowns);
    }

    function closeAllDropdowns() {
        document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('active'));
        const notifDD = document.getElementById('notification-dropdown');
        if (notifDD) notifDD.classList.remove('active');
    }

    // ================================================================
    // Notification Bell Dropdown
    // ================================================================
    function initNotificationBell() {
        const bellBtn  = document.querySelector('.icon-btn[title="View Reminders"]');
        const dropdown = document.getElementById('notification-dropdown');

        if (bellBtn && dropdown) {
            bellBtn.style.position = 'relative';
            bellBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('active');
                if (dropdown.classList.contains('active')) {
                    await populateNotifDropdown();
                }
            });

            document.addEventListener('click', (e) => {
                if (!dropdown.contains(e.target) && !bellBtn.contains(e.target)) {
                    dropdown.classList.remove('active');
                }
            });
        }
    }

    async function populateNotifDropdown() {
        const dropdown = document.getElementById('notification-dropdown');
        if (!dropdown) return;

        const list = dropdown.querySelector('.notif-list');
        if (!list) return;

        try {
            const reminders = await API.reminders.getAll();
            const unread    = reminders.filter(r => !r.isRead).slice(0, 6);

            if (unread.length === 0) {
                list.innerHTML = `
                    <div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.86rem;">
                        <i class="fas fa-check-circle" style="font-size: 1.5rem; color: var(--success); margin-bottom: 8px; display: block;"></i>
                        You're all caught up! No unread alerts.
                    </div>`;
            } else {
                list.innerHTML = unread.map(r => `
                    <div class="notif-item unread" onclick="RemindersManager.markAsRead(${r.id}); App.navigateTo('reminders');">
                        <div class="notif-dot"></div>
                        <div class="notif-body">
                            <p>${escapeHtml(r.title)}</p>
                            <span>${escapeHtml(r.message.substring(0, 80))}${r.message.length > 80 ? '…' : ''}</span>
                        </div>
                    </div>
                `).join('');
            }
        } catch (err) {
            list.innerHTML = `<div style="padding: 16px; color: var(--text-muted); font-size: 0.84rem;">Failed to load notifications.</div>`;
        }
    }

    // ================================================================
    // Mobile FAB Button
    // ================================================================
    function initMobileFAB() {
        const fabBtn = document.getElementById('mobile-fab-btn');
        if (!fabBtn) return;

        fabBtn.addEventListener('click', () => {
            // Show context-sensitive add modal based on current view
            if (currentView === 'exams') {
                ExamsManager.openAddModal();
            } else if (currentView === 'reminders') {
                RemindersManager.openAddModal();
            } else {
                AssignmentsManager.openAddModal();
            }
        });
    }

    // ================================================================
    // Keyboard Shortcuts
    // ================================================================
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only fire when not typing in an input/textarea
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

            // No modifier keys (except Ctrl/Cmd for shortcuts)
            if (e.altKey) return;

            switch (e.key) {
                case '1': case 'd': navigateTo('dashboard');   break;
                case '2': case 'a': navigateTo('assignments'); break;
                case '3': case 'e': navigateTo('exams');       break;
                case '4': case 'c': navigateTo('calendar');    break;
                case '5': case 'n': navigateTo('analytics');   break;
                case '6': case 'r': navigateTo('reminders');   break;
                case '+': case 'N':
                    if (currentView === 'exams') ExamsManager.openAddModal();
                    else AssignmentsManager.openAddModal();
                    break;
                case 't':
                    // Toggle theme
                    const current = document.documentElement.getAttribute('data-theme') || 'dark';
                    setTheme(current === 'dark' ? 'light' : 'dark');
                    break;
            }
        });
    }

    // ================================================================
    // Backend Connectivity Monitor
    // ================================================================
    async function initBackendStatusCheck() {
        const pill = document.getElementById('backend-status-pill');
        const text = document.getElementById('backend-status-text');

        async function updateStatus() {
            const connected = await API.checkBackendConnection();
            if (pill && text) {
                if (connected) {
                    pill.className = 'backend-pill online';
                    text.textContent = 'REST API Connected';
                    pill.title = 'Connected to Spring Boot Backend at http://localhost:8080/api';
                } else {
                    pill.className = 'backend-pill demo';
                    text.textContent = 'Local / Demo Mode';
                    pill.title = 'Spring Boot not detected — running in browser offline demo mode';
                }
            }
        }

        await updateStatus();
        setInterval(updateStatus, 20000);

        if (pill) pill.addEventListener('click', () => navigateTo('settings'));
    }

    // ================================================================
    // Settings Panel Handlers
    // ================================================================
    function initSettingsHandlers() {
        const apiUrlInput = document.getElementById('settings-api-url');
        const saveApiBtn  = document.getElementById('save-api-url-btn');

        if (apiUrlInput) apiUrlInput.value = API.getBaseUrl();
        if (saveApiBtn && apiUrlInput) {
            saveApiBtn.addEventListener('click', async () => {
                const url = apiUrlInput.value.trim();
                if (url) {
                    API.setBaseUrl(url);
                    showToast('API URL updated. Re-checking connection…', 'info');
                    await API.checkBackendConnection();
                    await initBackendStatusCheck();
                }
            });
        }

        // Mode radio buttons
        document.querySelectorAll('input[name="data-mode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const demo = e.target.value === 'demo';
                API.setForceDemoMode(demo);
                showToast(demo ? 'Switched to In-Browser Demo Mode' : 'Switched to Spring Boot REST Mode', 'info');
                initBackendStatusCheck();
                refreshCurrentView();
            });
        });

        // Reset sample data button
        const resetBtn = document.getElementById('reset-sample-data-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Reset all local data to default university sample? This will clear your custom assignments.')) {
                    API.resetDemoData();
                    showToast('Sample data restored!', 'success');
                    AuthManager.renderUserProfile();
                    refreshCurrentView();
                }
            });
        }
    }

    // ================================================================
    // Toast Notification System
    // ================================================================
    function showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const iconMap = {
            success: `<i class="fas fa-check-circle" style="color:var(--success);font-size:1.1rem;flex-shrink:0;"></i>`,
            error:   `<i class="fas fa-exclamation-circle" style="color:var(--danger);font-size:1.1rem;flex-shrink:0;"></i>`,
            info:    `<i class="fas fa-info-circle" style="color:var(--info);font-size:1.1rem;flex-shrink:0;"></i>`,
            warning: `<i class="fas fa-exclamation-triangle" style="color:var(--warning);font-size:1.1rem;flex-shrink:0;"></i>`
        };

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `${iconMap[type] || iconMap.info}<span style="flex:1;">${escapeHtml(message)}</span>
            <button style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:0.9rem;padding:0 0 0 8px;"
                    onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>`;

        container.appendChild(toast);

        // Auto-remove after 3.5 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(40px)';
            setTimeout(() => toast.remove(), 350);
        }, 3500);
    }

    // Simple HTML escaper used across modules
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    return {
        init,
        navigateTo,
        refreshCurrentView,
        openModal,
        closeModal,
        showToast,
        setTheme,
        escapeHtml
    };
})();

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => App.init());
