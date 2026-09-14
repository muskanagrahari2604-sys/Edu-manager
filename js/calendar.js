// ====================================================================
// Academic Calendar Module
// ====================================================================

const CalendarManager = (() => {
    let currentDate = new Date();

    function init() {
        const prevBtn = document.getElementById('cal-prev-btn');
        const nextBtn = document.getElementById('cal-next-btn');
        const todayBtn = document.getElementById('cal-today-btn');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                currentDate.setMonth(currentDate.getMonth() - 1);
                renderCalendar();
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                currentDate.setMonth(currentDate.getMonth() + 1);
                renderCalendar();
            });
        }
        if (todayBtn) {
            todayBtn.addEventListener('click', () => {
                currentDate = new Date();
                renderCalendar();
            });
        }
    }

    async function loadCalendar() {
        renderCalendar();
    }

    async function renderCalendar() {
        const titleEl = document.getElementById('cal-month-year');
        const gridEl = document.getElementById('cal-grid-days');
        if (!gridEl || !titleEl) return;

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        titleEl.textContent = `${monthNames[month]} ${year}`;

        // Fetch assignments and exams
        let assignments = [];
        let exams = [];
        try {
            assignments = await API.assignments.getAll();
            exams = await API.exams.getAll();
        } catch (err) {
            console.error("Error loading events for calendar", err);
        }

        // Map events by date (YYYY-MM-DD)
        const eventMap = {};
        assignments.forEach(a => {
            const d = a.dueDate.split('T')[0];
            if (!eventMap[d]) eventMap[d] = [];
            eventMap[d].push({ type: 'assignment', data: a });
        });
        exams.forEach(e => {
            const d = e.examDate;
            if (!eventMap[d]) eventMap[d] = [];
            eventMap[d].push({ type: 'exam', data: e });
        });

        // Calendar grid calculations
        const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
        const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
        const prevMonthLastDay = new Date(year, month, 0).getDate();

        gridEl.innerHTML = '';
        const todayStr = new Date().toISOString().split('T')[0];

        // Prev month padding days
        for (let i = firstDayIndex; i > 0; i--) {
            const dayNum = prevMonthLastDay - i + 1;
            const prevMonthDate = new Date(year, month - 1, dayNum);
            const dateStr = prevMonthDate.toISOString().split('T')[0];
            gridEl.appendChild(createDayCell(dayNum, dateStr, eventMap[dateStr] || [], true, false));
        }

        // Current month days
        for (let day = 1; day <= totalDaysInMonth; day++) {
            const curDate = new Date(year, month, day);
            // Format YYYY-MM-DD
            const y = curDate.getFullYear();
            const m = String(curDate.getMonth() + 1).padStart(2, '0');
            const d = String(day).padStart(2, '0');
            const dateStr = `${y}-${m}-${d}`;
            const isToday = (dateStr === todayStr);

            gridEl.appendChild(createDayCell(day, dateStr, eventMap[dateStr] || [], false, isToday));
        }

        // Next month padding days to fill 35 or 42 grid cells
        const totalCellsRendered = firstDayIndex + totalDaysInMonth;
        const remainingCells = (totalCellsRendered > 35 ? 42 : 35) - totalCellsRendered;
        for (let j = 1; j <= remainingCells; j++) {
            const nextDate = new Date(year, month + 1, j);
            const dateStr = nextDate.toISOString().split('T')[0];
            gridEl.appendChild(createDayCell(j, dateStr, eventMap[dateStr] || [], true, false));
        }
    }

    function createDayCell(dayNumber, dateStr, events, isOtherMonth, isToday) {
        const cell = document.createElement('div');
        cell.className = `calendar-day-cell ${isOtherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`;

        let eventsHtml = '';
        if (events && events.length > 0) {
            eventsHtml = events.map(ev => {
                if (ev.type === 'assignment') {
                    return `
                        <div class="cal-event-pill assignment" onclick="CalendarManager.showEventModal('assignment', ${ev.data.id})"
                             title="${DashboardManager.escapeHtml(ev.data.title)} (${ev.data.subject})">
                            <i class="fas fa-tasks" style="margin-right: 3px; font-size: 0.65rem;"></i>
                            ${DashboardManager.escapeHtml(ev.data.title)}
                        </div>
                    `;
                } else {
                    return `
                        <div class="cal-event-pill exam" onclick="CalendarManager.showEventModal('exam', ${ev.data.id})"
                             title="EXAM: ${DashboardManager.escapeHtml(ev.data.examTitle)} (${ev.data.subject})">
                            <i class="fas fa-graduation-cap" style="margin-right: 3px; font-size: 0.65rem;"></i>
                            ${DashboardManager.escapeHtml(ev.data.examTitle)}
                        </div>
                    `;
                }
            }).join('');
        }

        cell.innerHTML = `
            <div class="day-cell-top">
                <span class="day-number">${dayNumber}</span>
                ${events.length > 0 ? `<span style="font-size: 0.68rem; font-weight: 700; color: var(--text-muted);">${events.length}</span>` : ''}
            </div>
            <div class="day-events-container">
                ${eventsHtml}
            </div>
        `;

        return cell;
    }

    async function showEventModal(type, id) {
        if (type === 'assignment') {
            AssignmentsManager.openEditModal(id);
        } else {
            ExamsManager.openEditModal(id);
        }
    }

    return {
        init,
        loadCalendar,
        renderCalendar,
        showEventModal
    };
})();
