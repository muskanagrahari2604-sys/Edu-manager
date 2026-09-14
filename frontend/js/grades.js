// ====================================================================
// Grades & GPA Tracker Module
// Persistent via localStorage key 'sm_grades_data'
// ====================================================================

const GradesManager = (() => {
    const STORAGE_KEY = 'sm_grades_data';

    // 4.0 GPA scale lookup
    const GPA_SCALE = [
        { min: 93, letter: 'A',  points: 4.0 },
        { min: 90, letter: 'A-', points: 3.7 },
        { min: 87, letter: 'B+', points: 3.3 },
        { min: 83, letter: 'B',  points: 3.0 },
        { min: 80, letter: 'B-', points: 2.7 },
        { min: 77, letter: 'C+', points: 2.3 },
        { min: 73, letter: 'C',  points: 2.0 },
        { min: 70, letter: 'C-', points: 1.7 },
        { min: 67, letter: 'D+', points: 1.3 },
        { min: 63, letter: 'D',  points: 1.0 },
        { min: 60, letter: 'D-', points: 0.7 },
        { min: 0,  letter: 'F',  points: 0.0 }
    ];

    const GRADE_COLORS = {
        'A':  'var(--success)', 'A-': 'var(--success)',
        'B+': '#22d3ee',        'B':  'var(--info)',   'B-': 'var(--info)',
        'C+': 'var(--warning)', 'C':  'var(--warning)','C-': 'var(--warning)',
        'D+': 'var(--danger)',  'D':  'var(--danger)', 'D-': 'var(--danger)',
        'F':  '#6b7280'
    };

    function getGradeInfo(score) {
        for (const entry of GPA_SCALE) {
            if (score >= entry.min) return entry;
        }
        return GPA_SCALE[GPA_SCALE.length - 1];
    }

    // ================================================================
    // Storage
    // ================================================================
    function loadGrades() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);

        // Seed sample data
        const seed = [
            { id: 1, subject: 'Data Structures & Algorithms',  semester: 'Fall 2026', credits: 4, score: 88, notes: 'Final project due Week 14' },
            { id: 2, subject: 'Operating Systems',             semester: 'Fall 2026', credits: 3, score: 75, notes: '' },
            { id: 3, subject: 'Database Management Systems',   semester: 'Fall 2026', credits: 3, score: 92, notes: 'Strong in SQL topics' },
            { id: 4, subject: 'Computer Networks',             semester: 'Fall 2026', credits: 3, score: 67, notes: 'Need to revise TCP/IP' },
            { id: 5, subject: 'Software Engineering',          semester: 'Fall 2026', credits: 3, score: 95, notes: 'Group project in progress' },
            { id: 6, subject: 'Discrete Mathematics',          semester: 'Spring 2026', credits: 3, score: 80, notes: '' },
            { id: 7, subject: 'Linear Algebra',                semester: 'Spring 2026', credits: 3, score: 71, notes: '' },
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
        return seed;
    }

    function saveGrades(grades) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(grades));
    }

    function getNextId(grades) {
        return grades.length > 0 ? Math.max(...grades.map(g => g.id)) + 1 : 1;
    }

    // ================================================================
    // Main Load / Render
    // ================================================================
    function loadGrades_view() {
        const grades = loadGrades();
        const filterSem = document.getElementById('grades-filter-semester')?.value || '';
        const filtered  = filterSem ? grades.filter(g => g.semester === filterSem) : grades;

        renderMetrics(grades);  // metrics always show all
        renderTable(filtered);
        renderChart(filtered);
    }

    function renderMetrics(grades) {
        if (!grades.length) {
            setText('gpa-cumulative', '0.00');
            setText('gpa-letter-grade', 'No grades yet');
            setText('gpa-subjects-count', '0');
            setText('gpa-highest', '—');
            setText('gpa-highest-subject', 'N/A');
            setText('gpa-low-count', '0');
            return;
        }

        // Weighted GPA = Σ(points × credits) / Σcredits
        const totalCredits = grades.reduce((sum, g) => sum + Number(g.credits), 0);
        const weightedSum  = grades.reduce((sum, g) => {
            const info = getGradeInfo(Number(g.score));
            return sum + info.points * Number(g.credits);
        }, 0);

        const gpa = totalCredits > 0 ? (weightedSum / totalCredits).toFixed(2) : '0.00';
        const gpaNum = parseFloat(gpa);

        // Letter grade from GPA
        let gpaLetter = 'N/A';
        if (gpaNum >= 3.85)      gpaLetter = '🏆 Summa Cum Laude (A)';
        else if (gpaNum >= 3.5)  gpaLetter = '🎓 Magna Cum Laude (A-)';
        else if (gpaNum >= 3.0)  gpaLetter = '👏 Cum Laude (B)';
        else if (gpaNum >= 2.0)  gpaLetter = '✅ Satisfactory (C)';
        else                     gpaLetter = '⚠️ Below Satisfactory';

        const highGrade = grades.reduce((a, b) => Number(a.score) > Number(b.score) ? a : b);
        const lowCount  = grades.filter(g => Number(g.score) < 70).length;

        setText('gpa-cumulative', gpa);
        setText('gpa-letter-grade', gpaLetter);
        setText('gpa-subjects-count', grades.length);
        setText('gpa-highest', `${highGrade.score}%`);
        setText('gpa-highest-subject', highGrade.subject);
        setText('gpa-low-count', lowCount);
    }

    function renderTable(grades) {
        const tbody = document.getElementById('grades-table-body');
        if (!tbody) return;

        if (grades.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 48px 16px;">
                        <div class="empty-state" style="padding: 0;">
                            <div class="empty-state-icon">
                                <i class="fas fa-graduation-cap" style="color: var(--primary-light);"></i>
                            </div>
                            <h4 style="font-size: 1rem;">No grades recorded yet</h4>
                            <p style="font-size: 0.84rem;">Click "Add Grade" to record your first subject grade.</p>
                        </div>
                    </td>
                </tr>`;
            return;
        }

        tbody.innerHTML = grades.map(g => {
            const info    = getGradeInfo(Number(g.score));
            const weighted = (info.points * Number(g.credits)).toFixed(1);
            const color   = GRADE_COLORS[info.letter] || 'var(--text-muted)';
            const rowClass = Number(g.score) < 70 ? 'overdue-row' : '';

            return `
                <tr class="${rowClass}">
                    <td>
                        <strong>${App.escapeHtml(g.subject)}</strong>
                        ${g.notes ? `<div style="font-size:0.74rem; color:var(--text-muted); margin-top:2px;">${App.escapeHtml(g.notes.substring(0, 50))}${g.notes.length > 50 ? '…' : ''}</div>` : ''}
                    </td>
                    <td><span class="badge" style="background:var(--bg-input);">${App.escapeHtml(g.semester)}</span></td>
                    <td style="text-align:center;">${g.credits}</td>
                    <td>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <div class="progress-bar-wrap" style="flex:1; min-width:60px;">
                                <div class="progress-bar-fill" style="width:${g.score}%; background:${color};"></div>
                            </div>
                            <span style="font-weight:700; font-size:0.9rem;">${g.score}%</span>
                        </div>
                    </td>
                    <td>
                        <span style="font-size:1rem; font-weight:800; color:${color};">${info.letter}</span>
                    </td>
                    <td style="text-align:center; font-weight:600;">${info.points.toFixed(1)}</td>
                    <td style="text-align:center; font-weight:700; color:${color};">${weighted}</td>
                    <td>
                        <div class="action-btns">
                            <button class="btn-icon-action" title="Edit" onclick="GradesManager.openEditModal(${g.id})">
                                <i class="fas fa-pen"></i>
                            </button>
                            <button class="btn-icon-action danger" title="Delete" onclick="GradesManager.deleteGrade(${g.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function renderChart(grades) {
        const chartEl  = document.getElementById('grade-distribution-chart');
        const labelsEl = document.getElementById('grade-distribution-labels');
        if (!chartEl || !labelsEl) return;

        if (grades.length === 0) {
            chartEl.innerHTML = `<div style="color:var(--text-muted); font-size:0.86rem; width:100%; text-align:center;">No data to display.</div>`;
            labelsEl.innerHTML = '';
            return;
        }

        const maxScore = 100;
        const chartHeight = 160; // px

        chartEl.innerHTML = grades.map(g => {
            const info   = getGradeInfo(Number(g.score));
            const color  = GRADE_COLORS[info.letter] || 'var(--primary)';
            const barH   = Math.max(8, (Number(g.score) / maxScore) * chartHeight);
            const subj   = g.subject.length > 12 ? g.subject.substring(0, 12) + '…' : g.subject;

            return `
                <div style="display:flex; flex-direction:column; align-items:center; flex:1; gap:4px; cursor:default;" title="${App.escapeHtml(g.subject)}: ${g.score}% (${info.letter})">
                    <span style="font-size:0.72rem; font-weight:700; color:${color};">${g.score}%</span>
                    <div style="width:100%; max-width:52px; height:${barH}px; background:${color}; border-radius:6px 6px 0 0; opacity:0.85; transition:height 0.5s ease;"></div>
                </div>
            `;
        }).join('');

        labelsEl.innerHTML = grades.map(g => {
            const info   = getGradeInfo(Number(g.score));
            const color  = GRADE_COLORS[info.letter] || 'var(--primary)';
            const subj   = g.subject.length > 14 ? g.subject.substring(0, 14) + '…' : g.subject;
            return `<div style="flex:1; text-align:center; overflow:hidden; font-size:0.73rem;" title="${App.escapeHtml(g.subject)}">
                <span style="color:${color}; font-weight:700;">${info.letter}</span><br>
                <span style="font-size:0.68rem;">${App.escapeHtml(subj)}</span>
            </div>`;
        }).join('');
    }

    // ================================================================
    // Modal: Add / Edit
    // ================================================================
    function openAddModal() {
        const form = document.getElementById('grade-form');
        if (form) form.reset();

        const editId = document.getElementById('grade-edit-id');
        if (editId) editId.value = '';

        const title = document.getElementById('grade-modal-title');
        if (title) title.innerHTML = '<i class="fas fa-graduation-cap" style="color:var(--primary); margin-right:8px;"></i>Add Grade';

        // Reset semester to current
        const semInput = document.getElementById('grade-semester');
        if (semInput) semInput.value = 'Fall 2026';

        const badge = document.getElementById('grade-preview-badge-inner');
        if (badge) { badge.textContent = '—'; badge.style.background = 'var(--bg-input)'; badge.style.color = 'var(--text-muted)'; }

        App.openModal('grade-modal');
        document.getElementById('grade-subject')?.focus();
    }

    function openEditModal(id) {
        const grades = loadGrades();
        const grade  = grades.find(g => g.id === id);
        if (!grade) return;

        document.getElementById('grade-edit-id').value  = id;
        document.getElementById('grade-subject').value   = grade.subject;
        document.getElementById('grade-semester').value  = grade.semester;
        document.getElementById('grade-credits').value   = grade.credits;
        document.getElementById('grade-score').value     = grade.score;
        document.getElementById('grade-notes').value     = grade.notes || '';

        const info = getGradeInfo(Number(grade.score));
        const badge = document.getElementById('grade-preview-badge-inner');
        if (badge) {
            badge.textContent = info.letter;
            badge.style.background = GRADE_COLORS[info.letter] + '22';
            badge.style.color = GRADE_COLORS[info.letter];
        }

        const title = document.getElementById('grade-modal-title');
        if (title) title.innerHTML = '<i class="fas fa-pen" style="color:var(--primary); margin-right:8px;"></i>Edit Grade';

        App.openModal('grade-modal');
    }

    function setupFormListeners() {
        // Live grade preview on score input
        const scoreInput = document.getElementById('grade-score');
        if (scoreInput) {
            scoreInput.addEventListener('input', () => {
                const score = Number(scoreInput.value);
                const badge = document.getElementById('grade-preview-badge-inner');
                if (badge && score >= 0 && score <= 100) {
                    const info = getGradeInfo(score);
                    const color = GRADE_COLORS[info.letter] || 'var(--text-muted)';
                    badge.textContent = info.letter;
                    badge.style.background = color + '22';
                    badge.style.color = color;
                } else if (badge) {
                    badge.textContent = '—';
                    badge.style.background = 'var(--bg-input)';
                    badge.style.color = 'var(--text-muted)';
                }
            });
        }

        // Grade form submit
        const form = document.getElementById('grade-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                saveGradeEntry();
            });
        }

        // Semester filter
        const semFilter = document.getElementById('grades-filter-semester');
        if (semFilter) {
            semFilter.addEventListener('change', () => loadGrades_view());
        }
    }

    function saveGradeEntry() {
        const editId  = document.getElementById('grade-edit-id')?.value;
        const subject = document.getElementById('grade-subject')?.value.trim();
        const semester= document.getElementById('grade-semester')?.value.trim() || 'Fall 2026';
        const credits = Number(document.getElementById('grade-credits')?.value || 3);
        const score   = Number(document.getElementById('grade-score')?.value);
        const notes   = document.getElementById('grade-notes')?.value.trim() || '';

        if (!subject) { App.showToast('Please enter the subject name.', 'error'); return; }
        if (isNaN(score) || score < 0 || score > 100) { App.showToast('Score must be between 0 and 100.', 'error'); return; }

        const grades = loadGrades();

        if (editId) {
            const idx = grades.findIndex(g => g.id === Number(editId));
            if (idx !== -1) {
                grades[idx] = { ...grades[idx], subject, semester, credits, score, notes };
                App.showToast('Grade updated successfully!', 'success');
            }
        } else {
            grades.push({ id: getNextId(grades), subject, semester, credits, score, notes });
            App.showToast('Grade added!', 'success');
        }

        saveGrades(grades);
        App.closeModal('grade-modal');
        loadGrades_view();
    }

    function deleteGrade(id) {
        if (!confirm('Delete this grade entry?')) return;
        const grades = loadGrades().filter(g => g.id !== id);
        saveGrades(grades);
        App.showToast('Grade deleted.', 'info');
        loadGrades_view();
    }

    // ================================================================
    // Export to CSV
    // ================================================================
    function exportGrades() {
        const grades = loadGrades();
        if (grades.length === 0) { App.showToast('No grades to export.', 'warning'); return; }

        const headers = ['Subject', 'Semester', 'Credits', 'Score (%)', 'Grade', 'GPA Points', 'Notes'];
        const rows = grades.map(g => {
            const info = getGradeInfo(Number(g.score));
            return [
                `"${g.subject.replace(/"/g, '""')}"`,
                `"${g.semester}"`,
                g.credits,
                g.score,
                info.letter,
                info.points.toFixed(1),
                `"${(g.notes || '').replace(/"/g, '""')}"`
            ].join(',');
        });

        const csv  = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `grades_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        App.showToast('Grades exported to CSV!', 'success');
    }

    // ================================================================
    // Helpers
    // ================================================================
    function setText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    function init() {
        setupFormListeners();
    }

    return {
        init,
        loadGrades: loadGrades_view,
        openAddModal,
        openEditModal,
        deleteGrade,
        exportGrades
    };
})();
