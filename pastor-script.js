const attendanceDetails = document.getElementById('attendanceDetails');
const attendanceReport = document.getElementById('attendanceReport');
const reportNote = document.getElementById('reportNote');
const downloadWordBtn = document.getElementById('downloadWordBtn');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeDropdown = document.getElementById('themeDropdown');
const themeOptions = Array.from(document.querySelectorAll('.theme-option'));
const footerYear = document.getElementById('footerYear');

const STORAGE_KEYS = {
  pastorTheme: 'pastorTheme',
  sharedReport: 'churchAttendanceShared',
  sharedReportUpdatedAt: 'churchAttendanceSharedUpdatedAt'
};

const DEFAULT_WEEKLY_ATTENDANCE = [
  {
    day: 'Sunday Worship',
    value: 172,
    note: 'Powerful service with renewed faith and engaged attendance.',
  },
  {
    day: 'Wednesday Prayer',
    value: 139,
    note: 'Strong participation and intercessory prayer attendance.',
  },
  {
    day: 'Friday Fellowship',
    value: 96,
    note: 'Grace-filled fellowship and growing attendance.',
  },
];

const WEEK_SESSIONS = [
  { label: 'Sunday Worship', dayOffset: 0 },
  { label: 'Wednesday Prayer', dayOffset: 3 },
  { label: 'Friday Fellowship', dayOffset: 5 },
];

let weeklyAttendance = [...DEFAULT_WEEKLY_ATTENDANCE];
let sharedReport = null;

function setTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem(STORAGE_KEYS.pastorTheme, theme);
  themeOptions.forEach((option) => {
    option.classList.toggle('active', option.dataset.theme === theme);
  });
}

function getSavedTheme() {
  return localStorage.getItem(STORAGE_KEYS.pastorTheme) || 'light';
}

function getDayKey(date) {
  const d = new Date(date);
  return d.toISOString().slice(0, 10);
}

function formatDateLabel(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function loadSharedReport() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.sharedReport);
    if (!raw) {
      return null;
    }
    const report = JSON.parse(raw);
    if (!report || !report.weekStart || !report.workers || !report.attendance) {
      return null;
    }
    return report;
  } catch {
    return null;
  }
}

function buildWeeklyAttendanceFromReport(report) {
  const baseDate = new Date(report.weekStart);
  const attendanceList = WEEK_SESSIONS.map((session) => {
    const dayDate = new Date(baseDate);
    dayDate.setDate(baseDate.getDate() + session.dayOffset);
    const dayKey = getDayKey(dayDate);
    const count = Object.entries(report.attendance).reduce((total, [key, value]) => {
      if (!value) return total;
      return key.endsWith(`:${dayKey}`) ? total + 1 : total;
    }, 0);

    return {
      day: session.label,
      value: count,
      note: count > 0
        ? `Loaded from administrator report for ${formatDateLabel(dayDate)}.`
        : `No attendance recorded by administrator for ${formatDateLabel(dayDate)}.`,
    };
  });

  const hasAnyAttendance = attendanceList.some((item) => item.value > 0);
  if (!hasAnyAttendance) {
    return null;
  }

  return attendanceList;
}

function applySharedAttendance() {
  const report = loadSharedReport();
  if (!report) {
    sharedReport = null;
    weeklyAttendance = [...DEFAULT_WEEKLY_ATTENDANCE];
    reportNote.textContent = 'No administrator report has been shared yet. Showing a sample weekly summary until attendance arrives.';
    reportNote.classList.add('warning');
    return;
  }

  sharedReport = report;
  weeklyAttendance = buildWeeklyAttendanceFromReport(report);
  const weekStart = formatDateLabel(report.weekStart);
  reportNote.textContent = `Attendance details loaded from administrator for the week of ${weekStart}.`;
  reportNote.classList.remove('warning');
}

function renderAttendance() {
  attendanceReport.innerHTML = '';

  weeklyAttendance.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'report-card';

    card.innerHTML = `
      <h3>${item.day}</h3>
      <p><strong>Attendance:</strong> ${item.value}</p>
      <p>${item.note}</p>
    `;

    attendanceReport.appendChild(card);
  });
}

function renderAttendanceDetails() {
  attendanceDetails.innerHTML = '';
  if (!sharedReport) {
    return;
  }

  const baseDate = new Date(sharedReport.weekStart);
  const headingCells = WEEK_SESSIONS.map((session) => {
    const dayDate = new Date(baseDate);
    dayDate.setDate(baseDate.getDate() + session.dayOffset);
    return `${session.label}<br><span class="details-day-date">${formatDateLabel(dayDate)}</span>`;
  }).join('');

  const bodyRows = sharedReport.workers.map((worker) => {
    const cells = WEEK_SESSIONS.map((session) => {
      const dayDate = new Date(baseDate);
      dayDate.setDate(baseDate.getDate() + session.dayOffset);
      const recordKey = `${worker}:${getDayKey(dayDate)}`;
      return `<td class="status">${sharedReport.attendance[recordKey] ? '✓' : '✕'}</td>`;
    }).join('');
    return `<tr><td>${worker}</td>${cells}</tr>`;
  }).join('');

  const detailsCard = document.createElement('article');
  detailsCard.className = 'report-card details-card';
  detailsCard.innerHTML = `
    <h3>Attendance Details</h3>
    <p>Worker-level attendance from the administrator report.</p>
    <table class="details-table">
      <thead>
        <tr>
          <th>Worker</th>
          ${headingCells}
        </tr>
      </thead>
      <tbody>
        ${bodyRows}
      </tbody>
    </table>
  `;

  attendanceDetails.appendChild(detailsCard);
}

function buildSummary() {
  const total = weeklyAttendance.reduce((sum, item) => sum + item.value, 0);
  const largest = weeklyAttendance.reduce((best, item) => (item.value > best.value ? item : best), weeklyAttendance[0]);
  const average = weeklyAttendance.length ? Math.round(total / weeklyAttendance.length) : 0;

  const summaryCard = document.createElement('article');
  summaryCard.className = 'report-card';
  summaryCard.innerHTML = `
    <h3>Weekly Summary</h3>
    <div class="attendance-summary">
      <div class="summary-item"><span>Total Attendees</span><span>${total}</span></div>
      <div class="summary-item"><span>Average per Session</span><span>${average}</span></div>
      <div class="summary-item"><span>Top Session</span><span>${largest.day}</span></div>
    </div>
  `;

  attendanceReport.prepend(summaryCard);
}

function toggleThemeDropdown() {
  themeDropdown.classList.toggle('open');
}

function closeThemeDropdown() {
  themeDropdown.classList.remove('open');
}

function createWordDocument() {
  const title = 'Pastor Attendance Report';
  const date = new Date().toLocaleDateString();
  const rows = weeklyAttendance
    .map(
      (item) => `<tr><td>${item.day}</td><td>${item.value}</td><td>${item.note}</td></tr>`
    )
    .join('');

  const html = `
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: Arial, sans-serif; color: #202124; }
          h1 { color: #2356a8; }
          table { width: 100%; border-collapse: collapse; margin-top: 18px; }
          th, td { border: 1px solid #cccccc; padding: 10px; text-align: left; }
          th { background: #f4f4f4; }
          caption { caption-side: top; font-weight: bold; margin-bottom: 12px; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p>Date: ${date}</p>
        <table>
          <caption>Weekly Attendance Breakdown</caption>
          <thead>
            <tr><th>Session</th><th>Attendance</th><th>Notes</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', html], {
    type: 'application/msword',
  });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'Pastor_Attendance_Report.doc';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function refreshPageData() {
  applySharedAttendance();
  renderAttendance();
  buildSummary();
  renderAttendanceDetails();
}

function init() {
  footerYear.textContent = new Date().getFullYear();
  refreshPageData();
  setTheme(getSavedTheme());
}

themeToggleBtn.addEventListener('click', (event) => {
  event.stopPropagation();
  toggleThemeDropdown();
});

themeOptions.forEach((option) => {
  option.addEventListener('click', () => {
    setTheme(option.dataset.theme);
    closeThemeDropdown();
  });
});

document.addEventListener('click', (event) => {
  if (!themeDropdown.contains(event.target) && event.target !== themeToggleBtn) {
    closeThemeDropdown();
  }
});

window.addEventListener('storage', (event) => {
  if (event.key === STORAGE_KEYS.sharedReport || event.key === STORAGE_KEYS.sharedReportUpdatedAt) {
    refreshPageData();
  }
});

downloadWordBtn.addEventListener('click', createWordDocument);

init();
