// ====================================================================
// Reminders Module: Student Assignment & Exam Manager
// ====================================================================

const RemindersManager = (() => {
    let currentFilter = 'ALL';

    function init() {
        setupFilterListeners();
        setupFormListeners();
    }

    async function loadReminders() {
        try {
            const list = await API.reminders.getAll();
            renderReminders(list);
            updateNavBadge(list);
        } catch (err) {
            console.error("Failed to load reminders", err);
        }
    }

    function setupFilterListeners() {
        const filterBtns = document.querySelectorAll('.reminder-filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                loadReminders();
            });
        });

        const markAllBtn = document.getElementById('reminders-mark-all-btn');
        if (markAllBtn) {
            markAllBtn.addEventListener('click', async () => {
                try {
                    await API.reminders.markAllRead();
                    App.showToast("All reminders marked as read", "success");
                    loadReminders();
                } catch (err) {
                    App.showToast("Failed to mark all as read", "error");
                }
            });
        }
    }

    function updateNavBadge(list) {
        const unreadCount = list.filter(r => !r.isRead).length;
        const badges = document.querySelectorAll('.unread-reminders-badge');
        badges.forEach(b => {
            b.textContent = unreadCount;
            b.style.display = unreadCount > 0 ? 'inline-flex' : 'none';
        });

        const headerDot = document.getElementById('header-bell-badge');
        if (headerDot) {
            headerDot.style.display = unreadCount > 0 ? 'block' : 'none';
        }
    }

    function renderReminders(list) {
        const container = document.getElementById('reminders-list-container');
        if (!container) return;

        let filtered = list;
        if (currentFilter === 'UNREAD') {
            filtered = list.filter(r => !r.isRead);
        } else if (currentFilter === 'ASSIGNMENT') {
            filtered = list.filter(r => r.reminderType === 'ASSIGNMENT');
        } else if (currentFilter === 'EXAM') {
            filtered = list.filter(r => r.reminderType === 'EXAM');
        }

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon"><i class="far fa-bell-slash"></i></div>
                    <h4>No reminders found</h4>
                    <p>You have no active alerts for this category.</p>
                    <button class="btn-primary" onclick="RemindersManager.openAddModal()">
                        <i class="fas fa-plus"></i> Add Custom Reminder
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(r => {
            const iconMap = {
                'ASSIGNMENT': '<i class="fas fa-tasks"></i>',
                'EXAM': '<i class="fas fa-graduation-cap"></i>',
                'CUSTOM': '<i class="far fa-sticky-note"></i>'
            };
            const icon = iconMap[r.reminderType] || '<i class="far fa-bell"></i>';

            return `
                <div class="reminder-card ${!r.isRead ? 'unread' : ''}">
                    <div class="reminder-main">
                        <div class="reminder-icon ${(r.reminderType || 'custom').toLowerCase()}">
                            ${icon}
                        </div>
                        <div class="reminder-body">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <h5>${DashboardManager.escapeHtml(r.title)}</h5>
                                ${!r.isRead ? `<span class="badge badge-high" style="font-size: 0.68rem;">New</span>` : ''}
                            </div>
                            <p>${DashboardManager.escapeHtml(r.message)}</p>
                            <div class="reminder-date">
                                <i class="far fa-clock" style="margin-right: 4px;"></i>
                                ${DashboardManager.formatDate(r.reminderDate)}
                            </div>
                        </div>
                    </div>

                    <div class="action-btns-group">
                        ${!r.isRead ? `
                            <button class="btn-secondary" style="font-size: 0.78rem; padding: 6px 12px;"
                                    onclick="RemindersManager.markAsRead(${r.id})">
                                <i class="fas fa-check"></i> Mark Read
                            </button>
                        ` : ''}
                        <button class="btn-icon-action delete" onclick="RemindersManager.deleteReminder(${r.id})" title="Delete Reminder">
                            <i class="far fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    function setupFormListeners() {
        const form = document.getElementById('reminder-modal-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('reminder-form-title').value.trim();
            const message = document.getElementById('reminder-form-message').value.trim();
            const date = document.getElementById('reminder-form-date').value;

            if (!title || !message) {
                App.showToast("Please enter title and message", "error");
                return;
            }

            try {
                await API.reminders.create({
                    title,
                    message,
                    reminderDate: date ? new Date(date).toISOString() : new Date().toISOString(),
                    reminderType: 'CUSTOM'
                });
                App.showToast("Reminder created successfully!", "success");
                App.closeModal('reminder-modal');
                loadReminders();
                DashboardManager.loadDashboard();
            } catch (err) {
                App.showToast(err.message || "Failed to create reminder", "error");
            }
        });
    }

    function openAddModal() {
        const form = document.getElementById('reminder-modal-form');
        if (form) form.reset();

        const today = new Date();
        const isoString = today.toISOString().slice(0, 16);
        document.getElementById('reminder-form-date').value = isoString;

        App.openModal('reminder-modal');
    }

    async function markAsRead(id) {
        try {
            await API.reminders.markRead(id);
            App.showToast("Reminder marked as read", "success");
            loadReminders();
            DashboardManager.loadDashboard();
        } catch (err) {
            App.showToast("Failed to update reminder", "error");
        }
    }

    async function deleteReminder(id) {
        try {
            await API.reminders.delete(id);
            App.showToast("Reminder deleted", "info");
            loadReminders();
            DashboardManager.loadDashboard();
        } catch (err) {
            App.showToast("Failed to delete reminder", "error");
        }
    }

    return {
        init,
        loadReminders,
        openAddModal,
        markAsRead,
        deleteReminder
    };
})();
