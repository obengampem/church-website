const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeDropdown = document.getElementById('themeDropdown');
const themeOptions = Array.from(document.querySelectorAll('.theme-option'));
const workerInput = document.getElementById('workerInput');
const addWorkerBtn = document.getElementById('addWorkerBtn');
const sendPastorBtn = document.getElementById('sendPastorBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const workersList = document.getElementById('workersList');
const sendPastorModal = document.getElementById('sendPastorModal');
const closePastorModal = document.getElementById('closePastorModal');
const copyLinkBtn = document.getElementById('copyLinkBtn');
const shareLink = document.getElementById('shareLink');
const attendanceTracker = document.getElementById('attendanceTracker');
const weekLabel = document.getElementById('weekLabel');
const weekDates = document.getElementById('weekDates');
const prevWeek = document.getElementById('prevWeek');
const nextWeek = document.getElementById('nextWeek');
const footerYear = document.getElementById('footerYear');

const STORAGE_KEYS = {
  theme: 'churchAdminTheme',
  workers: 'churchWorkersList',
  attendance: 'churchAttendanceData',
  shareReport: 'churchAttendanceShared',
  shareReportUpdatedAt: 'churchAttendanceSharedUpdatedAt'
};

const WORSHIP_DAYS = ['Wednesday', 'Friday', 'Sunday'];
const WORSHIP_DAY_INDICES = [3, 5, 0]; // 0=Sunday, 3=Wednesday, 5=Friday

let currentWeekStart = getWeekStart(new Date());
let workers = loadWorkers();
let attendanceData = loadAttendance();

function init() {
  footerYear.textContent = new Date().getFullYear();
  applyStoredTheme();
  renderWorkers();
  updateWeekDisplay();
  renderAttendanceMatrix();
  themeDropdown.style.display = 'none';
}

function getWeekStart(date) {
  const weekDate = new Date(date);
  weekDate.setHours(0, 0, 0, 0);
  const dayIndex = weekDate.getDay();
  weekDate.setDate(weekDate.getDate() - dayIndex);
  return weekDate;
}

function formatDateLabel(date) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

function getDayKey(date) {
  const d = new Date(date);
  return d.toISOString().slice(0, 10);
}

function updateWeekDisplay() {
  const todayWeekStart = getWeekStart(new Date());
  if (currentWeekStart.getTime() === todayWeekStart.getTime()) {
    weekLabel.textContent = 'This Week';
  } else {
    weekLabel.textContent = `Week of ${formatDateLabel(currentWeekStart)}`;
  }

  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(currentWeekStart.getDate() + 6);
  weekDates.textContent = `${formatDateLabel(currentWeekStart)} — ${formatDateLabel(weekEnd)}`;
}

function applyStoredTheme() {
  const storedTheme = localStorage.getItem(STORAGE_KEYS.theme) || 'light';
  setTheme(storedTheme);
}

function setTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  themeOptions.forEach((option) => {
    option.classList.toggle('active', option.dataset.theme === theme);
  });
  localStorage.setItem(STORAGE_KEYS.theme, theme);
}

function loadWorkers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.workers)) || [];
  } catch {
    return [];
  }
}

function saveWorkers() {
  localStorage.setItem(STORAGE_KEYS.workers, JSON.stringify(workers));
}

function renderWorkers() {
  workersList.innerHTML = '';
  if (!workers.length) {
    workersList.innerHTML = '<div class="worker-card"><p>No workers added yet. Add names above to start tracking.</p></div>';
    return;
  }

  workers.forEach((name, index) => {
    const card = document.createElement('div');
    card.className = 'worker-card';

    const label = document.createElement('p');
    label.textContent = name;

    const actions = document.createElement('div');
    actions.className = 'worker-actions';

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.title = 'Remove worker';
    removeBtn.textContent = '✕';
    removeBtn.addEventListener('click', () => removeWorker(index));

    actions.appendChild(removeBtn);
    card.appendChild(label);
    card.appendChild(actions);
    workersList.appendChild(card);
  });
}

function addWorker() {
  const name = workerInput.value.trim();
  if (!name) {
    workerInput.focus();
    return;
  }

  if (workers.includes(name)) {
    alert('This worker has already been added.');
    workerInput.select();
    return;
  }

  workers.push(name);
  saveWorkers();
  workerInput.value = '';
  renderWorkers();
  renderAttendanceMatrix();
}

function removeWorker(index) {
  workers.splice(index, 1);
  saveWorkers();
  renderWorkers();
  renderAttendanceMatrix();
}

function clearWorkers() {
  if (!workers.length) {
    return;
  }
  const confirmed = confirm('Clear all workers from the list?');
  if (!confirmed) {
    return;
  }

  workers = [];
  saveWorkers();
  renderWorkers();
  renderAttendanceMatrix();
}

function loadAttendance() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.attendance)) || {};
  } catch {
    return {};
  }
}

function saveAttendance() {
  localStorage.setItem(STORAGE_KEYS.attendance, JSON.stringify(attendanceData));
}

function getAttendanceCount(dayKey) {
  return attendanceData[dayKey] || 0;
}

function updateAttendanceCount(dayKey, delta) {
  const current = getAttendanceCount(dayKey);
  const next = Math.max(0, current + delta);
  attendanceData[dayKey] = next;
  saveAttendance();
  renderAttendanceMatrix();
}

function renderAttendanceMatrix() {
  attendanceTracker.innerHTML = '';

  if (!workers.length) {
    const emptyMsg = document.createElement('p');
    emptyMsg.style.textAlign = 'center';
    emptyMsg.style.color = 'var(--muted)';
    emptyMsg.textContent = 'Add workers above to track attendance.';
    attendanceTracker.appendChild(emptyMsg);
    return;
  }

  const table = document.createElement('table');
  table.className = 'attendance-matrix';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  const nameHeader = document.createElement('th');
  nameHeader.textContent = 'Worker';
  headerRow.appendChild(nameHeader);

  WORSHIP_DAY_INDICES.forEach((dayIndex) => {
    const dayDate = new Date(currentWeekStart);
    dayDate.setDate(currentWeekStart.getDate() + dayIndex);
    const dayName = WORSHIP_DAYS[WORSHIP_DAY_INDICES.indexOf(dayIndex)];

    const th = document.createElement('th');
    th.textContent = `${dayName} (${formatDateLabel(dayDate)})`;
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  workers.forEach((workerName, workerIndex) => {
    const row = document.createElement('tr');

    const nameCell = document.createElement('td');
    nameCell.className = 'attendance-worker-name';
    nameCell.textContent = workerName;
    row.appendChild(nameCell);

    WORSHIP_DAY_INDICES.forEach((dayIndex) => {
      const dayDate = new Date(currentWeekStart);
      dayDate.setDate(currentWeekStart.getDate() + dayIndex);
      const dayKey = getDayKey(dayDate);
      const attendanceKey = `${workerName}:${dayKey}`;

      const cell = document.createElement('td');
      cell.style.textAlign = 'center';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'attendance-checkbox';
      checkbox.checked = isWorkerPresent(attendanceKey);
      checkbox.addEventListener('change', () => {
        toggleWorkerAttendance(attendanceKey);
      });

      cell.appendChild(checkbox);
      row.appendChild(cell);
    });

    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  attendanceTracker.appendChild(table);
}

function isWorkerPresent(attendanceKey) {
  return attendanceData[attendanceKey] === true;
}

function toggleWorkerAttendance(attendanceKey) {
  attendanceData[attendanceKey] = !isWorkerPresent(attendanceKey);
  saveAttendance();
}

function toggleThemeDropdown() {
  themeDropdown.style.display = themeDropdown.style.display === 'grid' ? 'none' : 'grid';
}

function openShareModal() {
  updateShareLink();
  sendPastorModal.classList.add('active');
}

function closeShareModal() {
  sendPastorModal.classList.remove('active');
}

function buildSharedReport() {
  return {
    generatedAt: new Date().toISOString(),
    weekStart: getDayKey(currentWeekStart),
    workers,
    attendance: attendanceData
  };
}

function updateShareLink(report) {
  const link = `${window.location.origin}${window.location.pathname}`;
  shareLink.value = link;
  localStorage.setItem(STORAGE_KEYS.shareReport, JSON.stringify(report));
  localStorage.setItem(STORAGE_KEYS.shareReportUpdatedAt, new Date().toISOString());
}

function sendReportToPastor() {
  const report = buildSharedReport();
  updateShareLink(report);
  openShareModal();
}

function copyShareLink() {
  if (!navigator.clipboard) {
    shareLink.select();
    document.execCommand('copy');
  } else {
    navigator.clipboard.writeText(shareLink.value);
  }
  copyLinkBtn.textContent = 'Copied!';
  setTimeout(() => {
    copyLinkBtn.textContent = 'Copy Link';
  }, 1200);
}

themeToggleBtn.addEventListener('click', toggleThemeDropdown);

themeOptions.forEach((option) => {
  option.addEventListener('click', () => setTheme(option.dataset.theme));
});

addWorkerBtn.addEventListener('click', addWorker);
workerInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    addWorker();
  }
});
clearAllBtn.addEventListener('click', clearWorkers);

sendPastorBtn.addEventListener('click', sendReportToPastor);
closePastorModal.addEventListener('click', closeShareModal);
copyLinkBtn.addEventListener('click', copyShareLink);

prevWeek.addEventListener('click', () => {
  currentWeekStart.setDate(currentWeekStart.getDate() - 7);
  updateWeekDisplay();
  renderAttendanceMatrix();
});

nextWeek.addEventListener('click', () => {
  currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  updateWeekDisplay();
  renderAttendanceMatrix();
});

window.addEventListener('click', (event) => {
  if (!themeDropdown.contains(event.target) && !themeToggleBtn.contains(event.target)) {
    themeDropdown.style.display = 'none';
  }
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeShareModal();
  }
});

init();
