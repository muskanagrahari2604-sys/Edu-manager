// ====================================================================
// Exams Module: Student Assignment & Exam Manager
// ====================================================================

const ExamsManager = (() => {
    let currentFilters = {
        prepStatus: 'ALL',
        priority: 'ALL',
        sortBy: 'date',
        search: ''
    };

    function init() {
        setupFilterListeners();
        setupFormListeners();
    }

    async function loadExams() {
        try {
            const list = await API.exams.getAll(currentFilters);
            renderExams(list);
        } catch (err) {
            console.error("Failed to load exams", err);
            App.showToast("Failed to load exams", "error");
        }
    }

    function setupFilterListeners() {
        const prepSelect = document.getElementById('exam-filter-prep');
        const prioritySelect = document.getElementById('exam-filter-priority');
        const sortSelect = document.getElementById('exam-sort-by');
        const searchInput = document.getElementById('exam-search-input');

        if (prepSelect) {
            prepSelect.addEventListener('change', (e) => {
                currentFilters.prepStatus = e.target.value;
                loadExams();
            });
        }
        if (prioritySelect) {
            prioritySelect.addEventListener('change', (e) => {
                currentFilters.priority = e.target.value;
                loadExams();
            });
        }
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                currentFilters.sortBy = e.target.value;
                loadExams();
            });
        }
        if (searchInput) {
            let debounceTimer;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    currentFilters.search = e.target.value;
                    loadExams();
                }, 250);
            });
        }
    }

    function renderExams(list) {
        const container = document.getElementById('exams-grid-container');
        if (!container) return;

        if (list.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="empty-state-icon"><i class="fas fa-graduation-cap"></i></div>
                    <h4>No exams scheduled</h4>
                    <p>Click "Add Exam" to schedule your upcoming midterm, quiz, or final exam.</p>
                    <button class="btn-primary" onclick="ExamsManager.openAddModal()">
                        <i class="fas fa-plus"></i> Add Exam
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = list.map(exam => {
            const daysLeft = DashboardManager.calculateDaysLeft(exam.examDate);
            let isImminent = daysLeft <= 2 && daysLeft >= 0;
            let pillText = `In ${daysLeft} days`;
            if (daysLeft === 0) pillText = "Today!";
            else if (daysLeft === 1) pillText = "Tomorrow!";
            else if (daysLeft < 0) pillText = "Completed / Past";

            const prepBadgeMap = {
                'NOT_STARTED': { text: 'Not Started', class: 'badge-pending' },
                'IN_PROGRESS': { text: 'In Progress', class: 'badge-progress' },
                'WELL_PREPARED': { text: 'Well Prepared', class: 'badge-completed' },
                'REVIEWING': { text: 'Reviewing', class: 'badge-low' }
            };
            const currentPrep = prepBadgeMap[exam.preparationStatus] || { text: exam.preparationStatus, class: 'badge-pending' };

            return `
                <div class="exam-card">
                    <div class="exam-badge-row">
                        <span class="countdown-pill ${isImminent ? 'imminent' : ''}">${pillText}</span>
                        <span class="badge badge-${exam.priority.toLowerCase()}">${exam.priority} Priority</span>
                    </div>

                    <h4 class="exam-title-text">${DashboardManager.escapeHtml(exam.examTitle)}</h4>
                    <div class="exam-subject-sub"><i class="fas fa-book" style="margin-right: 6px;"></i>${DashboardManager.escapeHtml(exam.subject)}</div>

                    <div class="exam-info-pill-grid">
                        <div class="exam-info-box">
                            <span><i class="far fa-calendar-alt"></i> Date & Time</span>
                            <strong>${DashboardManager.formatDate(exam.examDate)} at ${exam.examTime || '09:00'}</strong>
                        </div>
                        <div class="exam-info-box">
                            <span><i class="fas fa-map-marker-alt"></i> Venue</span>
                            <strong title="${DashboardManager.escapeHtml(exam.venue)}">${DashboardManager.escapeHtml(exam.venue || 'TBA')}</strong>
                        </div>
                    </div>

                    ${exam.syllabus ? `
                        <div class="syllabus-collapsible">
                            <button class="syllabus-trigger" onclick="ExamsManager.toggleSyllabus(this)">
                                <span><i class="fas fa-list-ul" style="margin-right: 6px;"></i> Syllabus & Topics</span>
                                <i class="fas fa-chevron-down"></i>
                            </button>
                            <div class="syllabus-content" style="display: none;">
                                ${DashboardManager.escapeHtml(exam.syllabus)}
                            </div>
                        </div>
                    ` : ''}

                    <div class="card-meta-row" style="margin-top: auto; padding-top: 14px; border-top: 1px solid var(--border-subtle);">
                        <div>
                            <span style="font-size: 0.74rem; color: var(--text-muted); display: block; margin-bottom: 3px;">Prep Status:</span>
                            <select class="filter-select" style="padding: 4px 8px; font-size: 0.78rem;"
                                    onchange="ExamsManager.changePrepStatus(${exam.id}, this.value)">
                                <option value="NOT_STARTED" ${exam.preparationStatus === 'NOT_STARTED' ? 'selected' : ''}>Not Started</option>
                                <option value="IN_PROGRESS" ${exam.preparationStatus === 'IN_PROGRESS' ? 'selected' : ''}>In Progress</option>
                                <option value="REVIEWING" ${exam.preparationStatus === 'REVIEWING' ? 'selected' : ''}>Reviewing</option>
                                <option value="WELL_PREPARED" ${exam.preparationStatus === 'WELL_PREPARED' ? 'selected' : ''}>Well Prepared</option>
                            </select>
                        </div>

                        <div class="action-btns-group">
                            <button class="btn-icon-action" onclick="ExamsManager.openEditModal(${exam.id})" title="Edit Exam">
                                <i class="far fa-edit"></i>
                            </button>
                            <button class="btn-icon-action delete" onclick="ExamsManager.deleteExam(${exam.id})" title="Delete Exam">
                                <i class="far fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function toggleSyllabus(btn) {
        const content = btn.nextElementSibling;
        const icon = btn.querySelector('.fa-chevron-down, .fa-chevron-up');
        if (content.style.display === 'none') {
            content.style.display = 'block';
            if (icon) { icon.classList.remove('fa-chevron-down'); icon.classList.add('fa-chevron-up'); }
        } else {
            content.style.display = 'none';
            if (icon) { icon.classList.remove('fa-chevron-up'); icon.classList.add('fa-chevron-down'); }
        }
    }

    function setupFormListeners() {
        const form = document.getElementById('exam-modal-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('exam-form-id').value;
            const subject = document.getElementById('exam-form-subject').value.trim();
            const examTitle = document.getElementById('exam-form-title').value.trim();
            const examDate = document.getElementById('exam-form-date').value;
            const examTime = document.getElementById('exam-form-time').value;
            const venue = document.getElementById('exam-form-venue').value.trim();
            const priority = document.getElementById('exam-form-priority').value;
            const prepStatus = document.getElementById('exam-form-prep').value;
            const syllabus = document.getElementById('exam-form-syllabus').value.trim();

            if (!subject || !examTitle || !examDate) {
                App.showToast("Please fill in all required fields", "error");
                return;
            }

            const payload = {
                subject,
                examTitle,
                examDate,
                examTime: examTime || '09:00',
                venue: venue || 'Main Academic Hall',
                priority,
                preparationStatus: prepStatus,
                syllabus
            };

            try {
                if (id) {
                    await API.exams.update(id, payload);
                    App.showToast("Exam updated successfully!", "success");
                } else {
                    await API.exams.create(payload);
                    App.showToast("Exam scheduled successfully!", "success");
                }
                App.closeModal('exam-modal');
                loadExams();
                DashboardManager.loadDashboard();
            } catch (err) {
                App.showToast(err.message || "Failed to save exam", "error");
            }
        });
    }

    function openAddModal() {
        const form = document.getElementById('exam-modal-form');
        if (form) form.reset();
        document.getElementById('exam-form-id').value = '';
        document.getElementById('exam-modal-title').textContent = 'Schedule New Exam';

        // Default exam date next week
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        document.getElementById('exam-form-date').value = nextWeek.toISOString().split('T')[0];
        document.getElementById('exam-form-time').value = '09:30';

        App.openModal('exam-modal');
    }

    async function openEditModal(id) {
        try {
            const e = await API.exams.getById(id);
            document.getElementById('exam-form-id').value = e.id;
            document.getElementById('exam-form-subject').value = e.subject;
            document.getElementById('exam-form-title').value = e.examTitle;
            document.getElementById('exam-form-date').value = e.examDate;
            document.getElementById('exam-form-time').value = e.examTime || '09:00';
            document.getElementById('exam-form-venue').value = e.venue || '';
            document.getElementById('exam-form-priority').value = e.priority;
            document.getElementById('exam-form-prep').value = e.preparationStatus;
            document.getElementById('exam-form-syllabus').value = e.syllabus || '';

            document.getElementById('exam-modal-title').textContent = 'Edit Exam';
            App.openModal('exam-modal');
        } catch (err) {
            App.showToast("Failed to load exam details", "error");
        }
    }

    async function changePrepStatus(id, prepStatus) {
        try {
            const e = await API.exams.getById(id);
            await API.exams.update(id, { ...e, preparationStatus: prepStatus });
            App.showToast("Preparation status updated", "success");
            loadExams();
            DashboardManager.loadDashboard();
        } catch (err) {
            App.showToast("Failed to update status", "error");
        }
    }

    async function deleteExam(id) {
        if (!confirm("Are you sure you want to delete this exam?")) return;
        try {
            await API.exams.delete(id);
            App.showToast("Exam removed from schedule", "info");
            loadExams();
            DashboardManager.loadDashboard();
        } catch (err) {
            App.showToast("Failed to delete exam", "error");
        }
    }

    function openDetail(id) {
        openEditModal(id);
    }

    return {
        init,
        loadExams,
        openAddModal,
        openEditModal,
        toggleSyllabus,
        changePrepStatus,
        deleteExam,
        openDetail
    };
})();
