/**
 * Chrome Initialization
 * 
 * Setup the overlay UI (panels, controls, status).
 * The chrome adapts to the device — the spatial core stays the same.
 */

import type { SpatialViewport } from '../viewport/SpatialViewport';
import type { BryceCamera } from '../viewport/BryceCamera';

export function initChrome(_viewport: SpatialViewport, _camera: BryceCamera) {
  // Panel collapse toggle
  document.querySelectorAll('.panel-collapse').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const panel = (e.target as HTMLElement).closest('.panel');
      if (panel) {
        panel.classList.toggle('collapsed');
        (e.target as HTMLElement).textContent = 
          panel.classList.contains('collapsed') ? '+' : '−';
      }
    });
  });
  
  // Theme toggle
  initTheme();
  
  // Populate hierarchy (placeholder)
  const hierarchy = document.getElementById('hierarchy');
  if (hierarchy) {
    hierarchy.innerHTML = `
      <div class="tree-item">
        <span class="tree-icon">&#9662;</span>
        <span class="tree-label">Scene</span>
      </div>
      <div class="tree-item" style="padding-left: 16px;">
        <span class="tree-icon">&#9728;</span>
        <span class="tree-label">Lights</span>
      </div>
      <div class="tree-item" style="padding-left: 16px;">
        <span class="tree-icon">&#9632;</span>
        <span class="tree-label">Box</span>
      </div>
      <div class="tree-item" style="padding-left: 16px;">
        <span class="tree-icon">&#9679;</span>
        <span class="tree-label">Sphere</span>
      </div>
      <div class="tree-item" style="padding-left: 16px;">
        <span class="tree-icon">&#9644;</span>
        <span class="tree-label">Cylinder</span>
      </div>
    `;
  }
  
  // Populate properties (placeholder)
  const properties = document.getElementById('properties');
  if (properties) {
    properties.innerHTML = `
      <div class="prop-section">
        <div class="prop-header">Transform</div>
        <div class="prop-row">
          <label>Position</label>
          <div class="prop-values">
            <input type="number" value="0" step="0.1">
            <input type="number" value="1" step="0.1">
            <input type="number" value="0" step="0.1">
          </div>
        </div>
        <div class="prop-row">
          <label>Rotation</label>
          <div class="prop-values">
            <input type="number" value="0" step="1">
            <input type="number" value="0" step="1">
            <input type="number" value="0" step="1">
          </div>
        </div>
        <div class="prop-row">
          <label>Scale</label>
          <div class="prop-values">
            <input type="number" value="1" step="0.1">
            <input type="number" value="1" step="0.1">
            <input type="number" value="1" step="0.1">
          </div>
        </div>
      </div>
    `;
  }
  
  // Initialize chat
  initChat();
  
  // Initialize theme hierarchy
  initThemeHierarchy();
  
  // Add chrome-specific styles
  addChromeStyles();
}

function initChat() {
  const input = document.getElementById('chat-input') as HTMLInputElement;
  const send = document.getElementById('chat-send');
  const messages = document.getElementById('chat-messages');
  
  if (!input || !send || !messages) return;
  
  // Welcome message
  addMessage('assistant', 'TONKA here. Tell me what to build.');
  
  function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    
    addMessage('user', text);
    input.value = '';
    
    // Placeholder response - will connect to actual AI later
    setTimeout(() => {
      addMessage('assistant', 'Got it. Working on it...');
    }, 500);
  }
  
  function addMessage(role: 'user' | 'assistant', text: string) {
    const msg = document.createElement('div');
    msg.className = `chat-message ${role}`;
    msg.textContent = text;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }
  
  send.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
}

function initThemeHierarchy() {
  const container = document.getElementById('theme-hierarchy');
  if (!container) return;
  
  // Theme data - will be loaded from tracking/epics.json later
  const themes = [
    { id: 1, name: 'Camera & Navigation', status: 'in-progress', version: 'v0.1', active: true, epics: [
      { name: 'Camera System', progress: 50 },
      { name: 'Viewport Controls', progress: 0 },
      { name: 'Input Abstraction', progress: 0 },
    ]},
    { id: 2, name: 'Environment Editing', status: 'todo', version: '-', active: true, epics: [] },
    { id: 3, name: 'Object Editing', status: 'todo', version: '-', active: true, epics: [] },
    { id: 4, name: 'Format Abstraction', status: 'todo', version: '-', active: false, epics: [] },
    { id: 5, name: 'World Modeling', status: 'todo', version: '-', active: false, epics: [] },
    { id: 6, name: 'Reality Anchoring', status: 'todo', version: '-', active: false, epics: [] },
    { id: 7, name: 'Remote Control', status: 'todo', version: '-', active: false, epics: [] },
    { id: 8, name: 'Output & Robotics', status: 'todo', version: '-', active: false, epics: [] },
    { id: 9, name: 'Simulation Training', status: 'todo', version: '-', active: false, epics: [] },
    { id: 10, name: 'Robot Integration', status: 'todo', version: '-', active: false, epics: [] },
  ];
  
  container.innerHTML = themes.map(theme => `
    <div class="theme-item" data-theme-id="${theme.id}">
      <div class="theme-header">
        <span class="theme-toggle">${theme.epics.length ? '>' : ''}</span>
        <span class="theme-status ${theme.status}"></span>
        <span class="theme-name">${theme.id}. ${theme.name}</span>
        <span class="theme-version">${theme.version}</span>
        <div class="theme-switch ${theme.active ? 'active' : ''}" data-theme-id="${theme.id}"></div>
      </div>
      ${theme.epics.length ? `
        <div class="epic-list">
          ${theme.epics.map(epic => `
            <div class="epic-item">
              <span>${epic.name}</span>
              <div class="epic-progress">
                <div class="epic-progress-bar" style="width: ${epic.progress}%"></div>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `).join('');
  
  // Toggle expand/collapse
  container.querySelectorAll('.theme-header').forEach(header => {
    header.addEventListener('click', (e) => {
      // Don't toggle if clicking the switch
      if ((e.target as HTMLElement).classList.contains('theme-switch')) return;
      
      const item = header.closest('.theme-item');
      if (item) {
        item.classList.toggle('expanded');
        const toggle = header.querySelector('.theme-toggle');
        if (toggle) {
          toggle.textContent = item.classList.contains('expanded') ? 'v' : '>';
        }
      }
    });
  });
  
  // Toggle active/inactive modules
  container.querySelectorAll('.theme-switch').forEach(sw => {
    sw.addEventListener('click', (e) => {
      e.stopPropagation();
      sw.classList.toggle('active');
      // Will dispatch event to actually enable/disable modules
      const themeId = (sw as HTMLElement).dataset.themeId;
      const active = sw.classList.contains('active');
      console.log(`Theme ${themeId} ${active ? 'enabled' : 'disabled'}`);
    });
  });
}

function initTheme() {
  // Check for saved preference or system preference
  const saved = localStorage.getItem('saw-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  
  document.documentElement.setAttribute('data-theme', theme);
  
  // Add theme toggle to top bar
  const topBar = document.getElementById('top-bar');
  if (topBar) {
    const toggle = document.createElement('button');
    toggle.className = 'theme-toggle';
    toggle.textContent = theme === 'dark' ? 'Light' : 'Dark';
    toggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('saw-theme', next);
      toggle.textContent = next === 'dark' ? 'Light' : 'Dark';
      
      // Dispatch event for viewport background update
      window.dispatchEvent(new CustomEvent('theme-change', { detail: { theme: next } }));
    });
    topBar.appendChild(toggle);
  }
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('saw-theme')) {
      const theme = e.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
      const toggle = document.querySelector('.theme-toggle');
      if (toggle) toggle.textContent = theme === 'dark' ? 'Light' : 'Dark';
      window.dispatchEvent(new CustomEvent('theme-change', { detail: { theme } }));
    }
  });
}

function addChromeStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* Tree items */
    .tree-item {
      padding: 4px 8px;
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      border-radius: 3px;
    }
    
    .tree-item:hover {
      background: rgba(74, 158, 255, 0.1);
    }
    
    .tree-icon {
      font-size: 12px;
    }
    
    .tree-label {
      font-size: 11px;
    }
    
    /* Properties */
    .prop-section {
      margin-bottom: 12px;
    }
    
    .prop-header {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-secondary);
      margin-bottom: 8px;
      padding-bottom: 4px;
      border-bottom: 1px solid var(--border-dark);
    }
    
    .prop-row {
      display: flex;
      align-items: center;
      margin-bottom: 6px;
    }
    
    .prop-row label {
      width: 60px;
      font-size: 10px;
      color: var(--text-muted);
    }
    
    .prop-values {
      display: flex;
      gap: 4px;
      flex: 1;
    }
    
    .prop-values input {
      width: 100%;
      background: var(--bg-input);
      border: 1px solid var(--border-dark);
      color: var(--text-primary);
      padding: 3px 6px;
      font-size: 10px;
      font-family: 'SF Mono', 'Consolas', monospace;
    }
    
    .prop-values input:focus {
      outline: none;
      border-color: var(--accent-blue);
    }
  `;
  document.head.appendChild(style);
}
