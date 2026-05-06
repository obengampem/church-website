const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeDropdown = document.getElementById('themeDropdown');
const themeOptions = Array.from(document.querySelectorAll('.theme-option'));
const footerYear = document.getElementById('footerYear');
const devTools = document.getElementById('devTools');

const STORAGE_KEYS = {
  devTheme: 'devTheme'
};

function setTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem(STORAGE_KEYS.devTheme, theme);
  themeOptions.forEach((option) => {
    option.classList.toggle('active', option.dataset.theme === theme);
  });
}

function getSavedTheme() {
  return localStorage.getItem(STORAGE_KEYS.devTheme) || 'light';
}

function toggleThemeDropdown() {
  themeDropdown.classList.toggle('open');
}

function closeThemeDropdown() {
  themeDropdown.classList.remove('open');
}

function createDevTool(title, description, content) {
  const card = document.createElement('article');
  card.className = 'dev-card';
  card.innerHTML = `
    <h3>${title}</h3>
    <p>${description}</p>
    ${content}
  `;
  return card;
}

function renderLocalStorageViewer() {
  const content = `
    <button class="dev-btn" id="refreshStorageBtn">Refresh Storage</button>
    <div class="dev-output" id="storageOutput"></div>
  `;
  const card = createDevTool('LocalStorage Viewer', 'View and manage browser localStorage data.', content);
  devTools.appendChild(card);

  const refreshBtn = document.getElementById('refreshStorageBtn');
  const output = document.getElementById('storageOutput');

  function updateStorageDisplay() {
    const keys = Object.keys(localStorage);
    if (keys.length === 0) {
      output.textContent = 'No localStorage data found.';
      return;
    }

    let display = '';
    keys.forEach(key => {
      const value = localStorage.getItem(key);
      display += `${key}: ${value}\n`;
    });
    output.textContent = display;
  }

  refreshBtn.addEventListener('click', updateStorageDisplay);
  updateStorageDisplay();
}

function renderStorageClearer() {
  const content = `
    <button class="dev-btn" id="clearStorageBtn">Clear All Storage</button>
    <div class="dev-output" id="clearOutput"></div>
  `;
  const card = createDevTool('Clear Storage', 'Remove all localStorage data.', content);
  devTools.appendChild(card);

  const clearBtn = document.getElementById('clearStorageBtn');
  const output = document.getElementById('clearOutput');

  clearBtn.addEventListener('click', () => {
    const confirmed = confirm('Clear all localStorage data? This cannot be undone.');
    if (confirmed) {
      localStorage.clear();
      output.textContent = 'All localStorage data cleared.';
      // Refresh other tools
      location.reload();
    }
  });
}

function renderJSRunner() {
  const content = `
    <textarea class="dev-textarea" id="jsInput" placeholder="Enter JavaScript code here..."></textarea>
    <button class="dev-btn" id="runJSBtn">Run Code</button>
    <div class="dev-output" id="jsOutput"></div>
  `;
  const card = createDevTool('JavaScript Runner', 'Execute JavaScript code in the console.', content);
  devTools.appendChild(card);

  const jsInput = document.getElementById('jsInput');
  const runBtn = document.getElementById('runJSBtn');
  const output = document.getElementById('jsOutput');

  runBtn.addEventListener('click', () => {
    const code = jsInput.value.trim();
    if (!code) {
      output.textContent = 'Please enter some JavaScript code.';
      return;
    }

    try {
      const result = eval(code);
      output.textContent = `Result: ${result}`;
    } catch (error) {
      output.textContent = `Error: ${error.message}`;
    }
  });
}

function renderPageInfo() {
  const content = `
    <button class="dev-btn" id="getInfoBtn">Get Page Info</button>
    <div class="dev-output" id="infoOutput"></div>
  `;
  const card = createDevTool('Page Information', 'Display current page details.', content);
  devTools.appendChild(card);

  const getInfoBtn = document.getElementById('getInfoBtn');
  const output = document.getElementById('infoOutput');

  getInfoBtn.addEventListener('click', () => {
    const info = {
      URL: window.location.href,
      UserAgent: navigator.userAgent,
      Language: navigator.language,
      CookiesEnabled: navigator.cookieEnabled,
      Online: navigator.onLine,
      ScreenWidth: screen.width,
      ScreenHeight: screen.height,
      ViewportWidth: window.innerWidth,
      ViewportHeight: window.innerHeight,
      LocalStorageItems: localStorage.length,
      SessionStorageItems: sessionStorage.length
    };

    let display = '';
    Object.entries(info).forEach(([key, value]) => {
      display += `${key}: ${value}\n`;
    });
    output.textContent = display;
  });
}

function init() {
  footerYear.textContent = new Date().getFullYear();
  setTheme(getSavedTheme());

  // Render dev tools
  renderLocalStorageViewer();
  renderStorageClearer();
  renderJSRunner();
  renderPageInfo();
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

init();