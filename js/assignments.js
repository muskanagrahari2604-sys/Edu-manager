// ====================================================================
// Assignments Module: Student Assignment & Exam Manager
// ====================================================================

const AssignmentsManager = (() => {
    let currentViewMode = 'table'; // 'table' or 'grid'
    let currentFilters = {
        status: 'ALL',
        priority: 'ALL',
        subject: 'ALL',
        sortBy: 'deadline',
        search: ''
    };

    function init() {
        setupFilterListeners();
        setupFormListeners();
    }

    async function loadAssignments() {
        try {
            const list = await API.assignments.getAll(currentFilters);
            renderSubjectsDropdown(list);

            if (currentViewMode === 'table') {
                renderTableView(list);
            } else {
                renderGridView(list);
            }
        } catch (err) {
            console.error("Failed to load assignments", err);
            App.showToast("Failed to load assignments", "error");
        }
    }

    function setupFilterListeners() {
        const statusSelect = document.getElementById('assign-filter-status');
        const prioritySelect = document.getElementById('assign-filter-priority');
        const subjectSelect = document.getElementById('assign-filter-subject');
        const sortSelect = document.getElementById('assign-sort-by');
        const searchInput = document.getElementById('assign-search-input');

        if (statusSelect) {
            statusSelect.addEventListener('change', (e) => {
                currentFilters.status = e.target.value;
                loadAssignments();
            });
        }
        if (prioritySelect) {
            prioritySelect.addEventListener('change', (e) => {
                currentFilters.priority = e.target.value;
                loadAssignments();
            });
        }
        if (subjectSelect) {
            subjectSelect.addEventListener('change', (e) => {
                currentFilters.subject = e.target.value;
                loadAssignments();
            });
        }
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                currentFilters.sortBy = e.target.value;
                loadAssignments();
            });
        }
        if (searchInput) {
            let debounceTimer;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    currentFilters.search = e.target.value;
                    loadAssignments();
                }, 250);
            });
        }

        // View Mode Toggle (Table / Cards)
        const tableBtn = document.getElementById('view-table-btn');
        const gridBtn = document.getElementById('view-grid-btn');

        if (tableBtn && gridBtn) {
            tableBtn.addEventListener('click', () => {
                currentViewMode = 'table';
                tableBtn.classList.add('active');
                gridBtn.classList.remove('active');
                document.getElementById('assignments-table-container').style.display = 'block';
                document.getElementById('assignments-grid-container').style.display = 'none';
                loadAssignments();
            });

            gridBtn.addEventListener('click', () => {
                currentViewMode = 'grid';
                gridBtn.classList.add('active');
                tableBtn.classList.remove('active');
                document.getElementById('assignments-table-container').style.display = 'none';
                document.getElementById('assignments-grid-container').style.display = 'grid';
                loadAssignments();
            });
        }
    }

    function renderSubjectsDropdown(list) {
        const select = document.getElementById('assign-filter-subject');
        if (!select) return;

        const currentVal = select.value;
        const subjects = new Set();
        list.forEach(a => { if (a.subject) subjects.add(a.subject); });

        // Keep 'ALL' and add unique subjects
        select.innerHTML = '<option value="ALL">All Subjects</option>';
        subjects.forEach(sub => {
            const opt = document.createElement('option');
            opt.value = sub;
            opt.textContent = sub;
            select.appendChild(opt);
        });

        if (subjects.has(currentVal)) {
            select.value = currentVal;
        }
    }

    function renderTableView(list) {
        const tbody = document.getElementById('assignments-table-body');
        if (!tbody) return;

        if (list.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7">
                        <div class="empty-state">
                            <div class="empty-state-icon"><i class="fas fa-tasks"></i></div>
                            <h4>No assignments found</h4>
                            <p>Try adjusting your search filters or click "Add Assignment" to create a new one.</p>
                            <button class="btn-primary" onclick="AssignmentsManager.openAddModal()">
                                <i class="fas fa-plus"></i> Add Assignment
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = list.map(a => {
            const daysLeft = DashboardManager.calculateDaysLeft(a.dueDate);
            let dueBadge = "badge-low";
            let dueText = `In ${daysLeft} days`;
            if (daysLeft < 0) { dueBadge = "badge-high"; dueText = "Overdue"; }
            else if (daysLeft === 0) { dueBadge = "badge-high"; dueText = "Due Today!"; }
            else if (daysLeft === 1) { dueBadge = "badge-medium"; dueText = "Due Tomorrow"; }

            const formattedDate = formatDateTime(a.dueDate);

            return `
                <tr>
                    <td style="width: 44px;">
                        <div class="custom-checkbox ${a.status === 'COMPLETED' ? 'checked' : ''}"
                             onclick="AssignmentsManager.toggleComplete(${a.id})"
                             title="Mark completed">
                            <i class="fas fa-check"></i>
                        </div>
                    </td>
                    <td>
                        <strong style="font-size: 0.95rem; cursor: pointer;" onclick="AssignmentsManager.openEditModal(${a.id})">
                            ${DashboardManager.escapeHtml(a.title)}
                        </strong>
                        <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">
                            ${DashboardManager.escapeHtml(a.description || 'No description provided')}
                        </div>
                    </td>
                    <td>
                        <span class="subject-tag">${DashboardManager.escapeHtml(a.subject)}</span>
                    </td>
                    <td>
                        <div>${formattedDate}</div>
                        <span class="badge ${dueBadge}" style="margin-top: 4px;">${dueText}</span>
                    </td>
                    <td>
                        <span class="badge badge-${a.priority.toLowerCase()}">${a.priority}</span>
                    </td>
                    <td>
                        <select class="filter-select" style="padding: 4px 8px; font-size: 0.78rem;"
                                onchange="AssignmentsManager.changeStatus(${a.id}, this.value)">
                            <option value="PENDING" ${a.status === 'PENDING' ? 'selected' : ''}>Pending</option>
                            <option value="IN_PROGRESS" ${a.status === 'IN_PROGRESS' ? 'selected' : ''}>In Progress</option>
                            <option value="COMPLETED" ${a.status === 'COMPLETED' ? 'selected' : ''}>Completed</option>
                        </select>
                    </td>
                    <td>
                        <div class="action-btns-group">
                            ${a.attachmentName ? `
                                <span class="btn-icon-action" title="Attachment: ${DashboardManager.escapeHtml(a.attachmentName)}">
                                    <i class="fas fa-paperclip" style="color: var(--primary);"></i>
                                </span>
                            ` : ''}
                            <button class="btn-icon-action" onclick="AssignmentsManager.openEditModal(${a.id})" title="Edit">
                                <i class="far fa-edit"></i>
                            </button>
                            <button class="btn-icon-action delete" onclick="AssignmentsManager.deleteAssignment(${a.id})" title="Delete">
                                <i class="far fa-trash-alt"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function renderGridView(list) {
        const grid = document.getElementById('assignments-grid-container');
        if (!grid) return;

        if (list.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="empty-state-icon"><i class="fas fa-tasks"></i></div>
                    <h4>No assignments found</h4>
                    <p>Try adjusting your search filters or click "Add Assignment" to create a new one.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = list.map(a => {
            const daysLeft = DashboardManager.calculateDaysLeft(a.dueDate);
            let dueBadge = "badge-low";
            let dueText = `In ${daysLeft} days`;
            if (daysLeft < 0) { dueBadge = "badge-high"; dueText = "Overdue"; }
            else if (daysLeft === 0) { dueBadge = "badge-high"; dueText = "Due Today!"; }
            else if (daysLeft === 1) { dueBadge = "badge-medium"; dueText = "Due Tomorrow"; }

            return `
                <div class="assignment-card">
                    <div class="card-top">
                        <span class="subject-tag">${DashboardManager.escapeHtml(a.subject)}</span>
                        <span class="badge badge-${a.priority.toLowerCase()}">${a.priority}</span>
                    </div>

                    <h4 class="card-title ${a.status === 'COMPLETED' ? 'task-title completed' : ''}"
                        onclick="AssignmentsManager.openEditModal(${a.id})" style="cursor: pointer;">
                        ${DashboardManager.escapeHtml(a.title)}
                    </h4>

                    <p class="card-description">
                        ${DashboardManager.escapeHtml(a.description || 'No description added for this assignment.')}
                    </p>

                    <div class="card-meta-list">
                        <div class="card-meta-row">
                            <span><i class="far fa-clock" style="margin-right: 6px;"></i>Due:</span>
                            <span><strong>${formatDateTime(a.dueDate)}</strong></span>
                        </div>
                        <div class="card-meta-row">
                            <span><i class="fas fa-hourglass-half" style="margin-right: 6px;"></i>Time Left:</span>
                            <span class="badge ${dueBadge}">${dueText}</span>
                        </div>
                        ${a.attachmentName ? `
                            <div class="card-meta-row">
                                <span><i class="fas fa-paperclip" style="margin-right: 6px;"></i>Attachment:</span>
                                <span style="font-size: 0.78rem; color: var(--primary);">${DashboardManager.escapeHtml(a.attachmentName)}</span>
                            </div>
                        ` : ''}
                    </div>

                    <div class="card-bottom">
                        <select class="filter-select" style="padding: 5px 10px; font-size: 0.8rem;"
                                onchange="AssignmentsManager.changeStatus(${a.id}, this.value)">
                            <option value="PENDING" ${a.status === 'PENDING' ? 'selected' : ''}>Pending</option>
                            <option value="IN_PROGRESS" ${a.status === 'IN_PROGRESS' ? 'selected' : ''}>In Progress</option>
                            <option value="COMPLETED" ${a.status === 'COMPLETED' ? 'selected' : ''}>Completed</option>
                        </select>

                        <div class="action-btns-group">
                            <button class="btn-icon-action" onclick="AssignmentsManager.openEditModal(${a.id})" title="Edit">
                                <i class="far fa-edit"></i>
                            </button>
                            <button class="btn-icon-action delete" onclick="AssignmentsManager.deleteAssignment(${a.id})" title="Delete">
                                <i class="far fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function setupFormListeners() {
        const form = document.getElementById('assignment-modal-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('assign-form-id').value;
            const title = document.getElementById('assign-form-title').value.trim();
            const subject = document.getElementById('assign-form-subject').value.trim();
            const dueDate = document.getElementById('assign-form-duedate').value;
            const priority = document.getElementById('assign-form-priority').value;
            const status = document.getElementById('assign-form-status').value;
            const description = document.getElementById('assign-form-desc').value.trim();
            const attachmentFile = document.getElementById('assign-form-file');
            let attachmentName = document.getElementById('assign-form-existing-file').value || null;

            if (attachmentFile && attachmentFile.files && attachmentFile.files[0]) {
                attachmentName = attachmentFile.files[0].name;
            }

            if (!title || !subject || !dueDate) {
                App.showToast("Please fill in all required fields", "error");
                return;
            }

            const payload = {
                title,
                subject,
                dueDate: new Date(dueDate).toISOString(),
                priority,
                status,
                description,
                attachmentName
            };

            try {
                if (id) {
                    await API.assignments.update(id, payload);
                    App.showToast("Assignment updated successfully!", "success");
                } else {
                    await API.assignments.create(payload);
                    App.showToast("New assignment created!", "success");
                }
                App.closeModal('assignment-modal');
                loadAssignments();
                DashboardManager.loadDashboard();
            } catch (err) {
                App.showToast(err.message || "Failed to save assignment", "error");
            }
        });
    }

    function openAddModal() {
        const form = document.getElementById('assignment-modal-form');
        if (form) form.reset();
        document.getElementById('assign-form-id').value = '';
        document.getElementById('assign-form-existing-file').value = '';
        document.getElementById('assignment-modal-title').textContent = 'Add New Assignment';

        // Set default due date to tomorrow 23:59
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(23, 59, 0, 0);
        const isoString = tomorrow.toISOString().slice(0, 16);
        document.getElementById('assign-form-duedate').value = isoString;

        App.openModal('assignment-modal');
    }

    async function openEditModal(id) {
        try {
            const a = await API.assignments.getById(id);
            document.getElementById('assign-form-id').value = a.id;
            document.getElementById('assign-form-title').value = a.title;
            document.getElementById('assign-form-subject').value = a.subject;
            document.getElementById('assign-form-priority').value = a.priority;
            document.getElementById('assign-form-status').value = a.status;
            document.getElementById('assign-form-desc').value = a.description || '';
            document.getElementById('assign-form-existing-file').value = a.attachmentName || '';

            if (a.dueDate) {
                const d = new Date(a.dueDate);
                const offset = d.getTimezoneOffset() * 60000;
                const localISOTime = (new Date(d - offset)).toISOString().slice(0, 16);
                document.getElementById('assign-form-duedate').value = localISOTime;
            }

            document.getElementById('assignment-modal-title').textContent = 'Edit Assignment';
            App.openModal('assignment-modal');
        } catch (err) {
            App.showToast("Failed to load assignment details", "error");
        }
    }

    async function toggleComplete(id) {
        try {
            await API.assignments.toggleComplete(id);
            App.showToast("Assignment updated!", "success");
            loadAssignments();
            DashboardManager.loadDashboard();
        } catch (err) {
            App.showToast("Failed to update status", "error");
        }
    }

    async function changeStatus(id, status) {
        try {
            await API.assignments.updateStatus(id, status);
            App.showToast(`Status changed to ${status.replace('_', ' ')}`, "success");
            loadAssignments();
            DashboardManager.loadDashboard();
        } catch (err) {
            App.showToast("Failed to update status", "error");
        }
    }

    async function deleteAssignment(id) {
        if (!confirm("Are you sure you want to delete this assignment?")) return;
        try {
            await API.assignments.delete(id);
            App.showToast("Assignment deleted", "info");
            loadAssignments();
            DashboardManager.loadDashboard();
        } catch (err) {
            App.showToast("Failed to delete assignment", "error");
        }
    }

    function formatDateTime(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' at ' +
               d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }

    return {
        init,
        loadAssignments,
        openAddModal,
        openEditModal,
        toggleComplete,
        changeStatus,
        deleteAssignment
    };
})();
