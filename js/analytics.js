// ====================================================================
// Productivity Analytics Module (Zero external dependencies HTML5 Canvas)
// ====================================================================

const AnalyticsManager = (() => {
    async function loadAnalytics() {
        try {
            const data = await API.analytics.getSummary();
            renderStats(data);
            renderStatusDonutChart(data);
            renderSubjectsBarChart(data);
            renderExamPrepChart(data);
            renderWorkloadPressure(data);
        } catch (err) {
            console.error("Failed to load analytics", err);
        }
    }

    function renderStats(data) {
        document.getElementById('analytics-completion-rate').textContent = `${data.completionRate}%`;
        document.getElementById('analytics-total-tasks').textContent = data.totalAssignments;
        document.getElementById('analytics-pending-tasks').textContent = data.pendingAssignments;
        document.getElementById('analytics-upcoming-exams').textContent = data.upcomingExams;
    }

    function setupCanvas(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        canvas.width = (rect.width || 300) * dpr;
        canvas.height = (rect.height || 220) * dpr;
        ctx.scale(dpr, dpr);
        return { ctx, width: rect.width || 300, height: rect.height || 220 };
    }

    // 1. Status Donut Chart
    function renderStatusDonutChart(data) {
        const setup = setupCanvas('chart-status-donut');
        if (!setup) return;
        const { ctx, width, height } = setup;

        const total = data.totalAssignments || 1;
        const completed = data.completedAssignments || 0;
        const inProgress = data.inProgressAssignments || 0;
        const pending = data.pendingAssignments || 0;

        const slices = [
            { label: 'Completed', value: completed, color: '#10b981' },
            { label: 'In Progress', value: inProgress, color: '#3b82f6' },
            { label: 'Pending', value: pending, color: '#f59e0b' }
        ];

        const centerX = width * 0.4;
        const centerY = height / 2;
        const radius = Math.min(centerX, centerY) - 16;
        const innerRadius = radius * 0.65;

        let startAngle = -Math.PI / 2;

        ctx.clearRect(0, 0, width, height);

        if (total === 0 || (completed === 0 && inProgress === 0 && pending === 0)) {
            // Draw empty ring
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.arc(centerX, centerY, innerRadius, 2 * Math.PI, 0, true);
            ctx.fillStyle = '#e2e8f0';
            ctx.fill();
        } else {
            slices.forEach(slice => {
                const sliceAngle = (slice.value / total) * 2 * Math.PI;
                if (slice.value > 0) {
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
                    ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
                    ctx.closePath();
                    ctx.fillStyle = slice.color;
                    ctx.fill();
                    startAngle += sliceAngle;
                }
            });
        }

        // Center Text
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        ctx.fillStyle = isDark ? '#f8fafc' : '#0f172a';
        ctx.font = 'bold 20px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${data.completionRate}%`, centerX, centerY - 8);

        ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
        ctx.font = '11px Plus Jakarta Sans, sans-serif';
        ctx.fillText('Completed', centerX, centerY + 12);

        // Legend on Right
        let legendY = centerY - 36;
        const legendX = width * 0.72;
        slices.forEach(slice => {
            ctx.fillStyle = slice.color;
            ctx.beginPath();
            ctx.arc(legendX, legendY, 5, 0, 2 * Math.PI);
            ctx.fill();

            ctx.fillStyle = isDark ? '#e2e8f0' : '#1e293b';
            ctx.font = '12px Plus Jakarta Sans, sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${slice.label} (${slice.value})`, legendX + 12, legendY);
            legendY += 26;
        });
    }

    // 2. Assignments By Subject Bar Chart
    function renderSubjectsBarChart(data) {
        const setup = setupCanvas('chart-subjects-bar');
        if (!setup) return;
        const { ctx, width, height } = setup;

        ctx.clearRect(0, 0, width, height);

        const subjects = data.subjectBreakdown || {};
        const labels = Object.keys(subjects);
        const values = Object.values(subjects);

        if (labels.length === 0) {
            ctx.fillStyle = '#94a3b8';
            ctx.font = '13px Plus Jakarta Sans, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('No subject data available', width / 2, height / 2);
            return;
        }

        const maxVal = Math.max(...values, 4);
        const paddingLeft = 32;
        const paddingBottom = 40;
        const paddingTop = 20;
        const paddingRight = 16;
        const chartWidth = width - paddingLeft - paddingRight;
        const chartHeight = height - paddingTop - paddingBottom;
        const barWidth = Math.min(36, (chartWidth / labels.length) * 0.6);

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

        labels.forEach((label, i) => {
            const val = values[i];
            const barHeight = (val / maxVal) * chartHeight;
            const x = paddingLeft + (i * (chartWidth / labels.length)) + ((chartWidth / labels.length - barWidth) / 2);
            const y = paddingTop + chartHeight - barHeight;

            // Bar gradient
            const grad = ctx.createLinearGradient(x, y, x, y + barHeight);
            grad.addColorStop(0, '#6366f1');
            grad.addColorStop(1, '#8b5cf6');

            ctx.fillStyle = grad;
            ctx.beginPath();
            // Rounded top corners
            const r = 4;
            ctx.roundRect ? ctx.roundRect(x, y, barWidth, barHeight, [r, r, 0, 0]) : ctx.rect(x, y, barWidth, barHeight);
            ctx.fill();

            // Value text above bar
            ctx.fillStyle = isDark ? '#e2e8f0' : '#0f172a';
            ctx.font = 'bold 11px Plus Jakarta Sans, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(val, x + barWidth / 2, y - 6);

            // Subject label below bar (truncated)
            ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
            ctx.font = '10px Plus Jakarta Sans, sans-serif';
            let shortLabel = label.length > 11 ? label.substring(0, 9) + '..' : label;
            ctx.fillText(shortLabel, x + barWidth / 2, paddingTop + chartHeight + 16);
        });
    }

    // 3. Exam Preparation Progress
    function renderExamPrepChart(data) {
        const container = document.getElementById('analytics-exam-prep-list');
        if (!container) return;

        const breakdown = data.examStatusBreakdown || {};
        const total = data.totalExams || 1;

        const statuses = [
            { key: 'WELL_PREPARED', label: 'Well Prepared', color: 'var(--success)' },
            { key: 'REVIEWING', label: 'Reviewing', color: 'var(--info)' },
            { key: 'IN_PROGRESS', label: 'In Progress', color: 'var(--warning)' },
            { key: 'NOT_STARTED', label: 'Not Started', color: 'var(--danger)' }
        ];

        container.innerHTML = statuses.map(s => {
            const count = breakdown[s.key] || 0;
            const pct = Math.round((count / total) * 100);
            return `
                <div style="margin-bottom: 14px;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.84rem; margin-bottom: 4px;">
                        <span><strong>${s.label}</strong></span>
                        <span style="color: var(--text-muted);">${count} exams (${pct}%)</span>
                    </div>
                    <div style="background: var(--bg-input); height: 8px; border-radius: 99px; overflow: hidden;">
                        <div style="width: ${pct}%; height: 100%; background: ${s.color}; border-radius: 99px; transition: width 0.6s ease;"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 4. Workload Stress Meter
    function renderWorkloadPressure(data) {
        const fillEl = document.getElementById('workload-stress-fill');
        const textEl = document.getElementById('workload-stress-text');
        if (!fillEl || !textEl) return;

        const pending = data.pendingAssignments || 0;
        const inProgress = data.inProgressAssignments || 0;
        const upcomingExams = data.upcomingExams || 0;

        // Weighted load score
        const loadScore = (pending * 1.5) + (inProgress * 1.0) + (upcomingExams * 3.0);
        let pct = Math.min(100, Math.round((loadScore / 25) * 100));

        fillEl.style.width = `${pct}%`;

        let statusText = "Low - Manageable workload";
        if (pct > 70) statusText = "High - Heavy exam & assignment workload ahead!";
        else if (pct > 40) statusText = "Moderate - Steady pace required";

        textEl.textContent = `${statusText} (${pct}% stress index)`;
    }

    return {
        loadAnalytics
    };
})();
