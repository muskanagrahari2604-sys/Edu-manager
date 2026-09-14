// ====================================================================
// Dashboard Module: Student Assignment & Exam Manager
// ====================================================================

const DashboardManager = (() => {
    async function loadDashboard() {
        try {
            const data = await API.analytics.getDashboard();
            renderMetrics(data);
            renderAlerts(data);
            renderTodayTasks(data.todayTasks || []);
            renderUpcomingExams(data.upcomingExams || []);
            renderDueSoon(data.dueSoonAssignments || []);
        } catch (err) {
            console.error("Failed to load dashboard data", err);
        }
    }

    function renderMetrics(data) {
        document.getElementById('metric-total-val').textContent = data.totalAssignments || 0;
        document.getElementById('metric-pending-val').textContent = data.pendingAssignments || 0;
        document.getElementById('metric-completed-val').textContent = data.completedAssignments || 0;
        document.getElementById('metric-exams-val').textContent = data.upcomingExamsCount || 0;

        // Completion % Radial Progress
        const pct = data.completionPercentage || 0;
        const pctText = document.getElementById('metric-progress-pct');
        const circleBar = document.getElementById('metric-progress-circle');

        if (pctText) pctText.textContent = `${pct}%`;
        if (circleBar) {
            const circumference = 2 * Math.PI * 24; // r=24 => 150.79
            const offset = circumference - (pct / 100) * circumference;
            circleBar.style.strokeDasharray = circumference;
            circleBar.style.strokeDashoffset = offset;
        }
    }

    function renderAlerts(data) {
        const container = document.getElementById('dashboard-alerts-strip');
        if (!container) return;

        const alerts = data.urgentReminders || [];
        if (alerts.length === 0) {
            container.innerHTML = '';
            return;
        }

        const topAlert = alerts[0];
        container.innerHTML = `
            <div class="urgent-alert-card">
                <div class="alert-left">
                    <div class="alert-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="alert-text">
                        <h4>${escapeHtml(topAlert.title)}</h4>
                        <p>${escapeHtml(topAlert.message)}</p>
                    </div>
                </div>
                <button class="alert-btn" onclick="App.navigateTo('reminders')">
                    View All (${alerts.length})
                </button>
            </div>
        `;
    }

    function renderTodayTasks(tasks) {
        const container = document.getElementById('dash-today-tasks');
        if (!container) return;

        if (tasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="padding: 24px 10px;">
                    <div class="empty-state-icon" style="width: 48px; height: 48px; font-size: 1.2rem; margin-bottom: 8px;">
                        <i class="fas fa-check-circle" style="color: var(--success);"></i>
                    </div>
                    <h5 style="font-size: 0.95rem; font-weight: 600;">All caught up for today!</h5>
                    <p style="font-size: 0.8rem;">No assignment deadlines scheduled specifically for today.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = tasks.map(task => `
            <div class="task-item">
                <div class="task-left">
                    <div class="custom-checkbox ${task.status === 'COMPLETED' ? 'checked' : ''}"
                         onclick="DashboardManager.toggleTaskComplete(${task.id})"
                         title="Mark as completed">
                        <i class="fas fa-check"></i>
                    </div>
                    <div class="task-details">
                        <div class="task-title ${task.status === 'COMPLETED' ? 'completed' : ''}">
                            ${escapeHtml(task.title)}
                        </div>
                        <div class="task-meta">
                            <span><i class="fas fa-book" style="margin-right: 4px;"></i>${escapeHtml(task.subject)}</span>
                            <span>•</span>
                            <span class="badge badge-${task.priority.toLowerCase()}">${task.priority}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function renderUpcomingExams(exams) {
        const container = document.getElementById('dash-upcoming-exams');
        if (!container) return;

        if (exams.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="padding: 24px 10px;">
                    <div class="empty-state-icon" style="width: 48px; height: 48px; font-size: 1.2rem; margin-bottom: 8px;">
                        <i class="fas fa-graduation-cap"></i>
                    </div>
                    <h5 style="font-size: 0.95rem; font-weight: 600;">No upcoming exams</h5>
                    <p style="font-size: 0.8rem;">Great job! You have no exams scheduled in the near future.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = exams.map(exam => {
            const daysLeft = calculateDaysLeft(exam.examDate);
            let pillText = `In ${daysLeft} days`;
            let isImminent = daysLeft <= 2;
            if (daysLeft === 0) pillText = "Today!";
            else if (daysLeft === 1) pillText = "Tomorrow!";
            else if (daysLeft < 0) pillText = "Past";

            return `
                <div class="exam-dash-card" onclick="ExamsManager.openDetail(${exam.id})" style="cursor: pointer;">
                    <div class="exam-dash-info">
                        <h5>${escapeHtml(exam.subject)}</h5>
                        <p><i class="far fa-calendar-alt" style="margin-right: 4px;"></i>${formatDate(exam.examDate)} at ${exam.examTime || '09:00'}</p>
                        <p style="font-size: 0.74rem; color: var(--text-light); margin-top: 2px;">
                            <i class="fas fa-map-marker-alt" style="margin-right: 4px;"></i>${escapeHtml(exam.venue || 'Campus Hall')}
                        </p>
                    </div>
                    <span class="countdown-pill ${isImminent ? 'imminent' : ''}">${pillText}</span>
                </div>
            `;
        }).join('');
    }

    function renderDueSoon(assignments) {
        const container = document.getElementById('dash-due-soon-table-body');
        if (!container) return;

        if (assignments.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 24px; color: var(--text-muted);">
                        <i class="fas fa-clipboard-check" style="font-size: 1.5rem; margin-bottom: 8px; display: block; color: var(--success);"></i>
                        No urgent assignment deadlines due in the next 72 hours.
                    </td>
                </tr>
            `;
            return;
        }

        container.innerHTML = assignments.map(a => {
            const daysLeft = calculateDaysLeft(a.dueDate);
            let badgeClass = "badge-low";
            let dueText = `In ${daysLeft} days`;
            if (daysLeft < 0) {
                badgeClass = "badge-high";
                dueText = "Overdue";
            } else if (daysLeft === 0) {
                badgeClass = "badge-high";
                dueText = "Due Today!";
            } else if (daysLeft === 1) {
                badgeClass = "badge-medium";
                dueText = "Due Tomorrow";
            }

            return `
                <tr>
                    <td>
                        <strong>${escapeHtml(a.title)}</strong>
                        <div style="font-size: 0.76rem; color: var(--text-muted);">${escapeHtml(a.subject)}</div>
                    </td>
                    <td><span class="badge ${badgeClass}">${dueText}</span></td>
                    <td><span class="badge badge-${a.priority.toLowerCase()}">${a.priority}</span></td>
                    <td>
                        <span class="badge badge-${a.status === 'COMPLETED' ? 'completed' : a.status === 'IN_PROGRESS' ? 'progress' : 'pending'}">
                            ${a.status.replace('_', ' ')}
                        </span>
                    </td>
                    <td>
                        <button class="btn-icon-action" onclick="DashboardManager.toggleTaskComplete(${a.id})" title="Toggle Complete">
                            <i class="fas fa-check"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    async function toggleTaskComplete(id) {
        try {
            await API.assignments.toggleComplete(id);
            App.showToast("Assignment status updated!", "success");
            loadDashboard();
        } catch (err) {
            App.showToast("Failed to update status", "error");
        }
    }

    function calculateDaysLeft(targetDateStr) {
        if (!targetDateStr) return 0;
        const target = new Date(targetDateStr.includes('T') ? targetDateStr : targetDateStr + 'T00:00:00');
        const now = new Date();
        const diffTime = target.getTime() - now.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    return {
        loadDashboard,
        toggleTaskComplete,
        formatDate,
        calculateDaysLeft,
        escapeHtml
    };
})();
