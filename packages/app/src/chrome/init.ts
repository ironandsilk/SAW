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
  
  // Initialize features dropdown
  initFeaturesDropdown();
  
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

function initFeaturesDropdown() {
  const btn = document.getElementById('features-btn');
  const dropdown = btn?.closest('.nav-dropdown');
  const timeline = document.getElementById('features-timeline');
  
  if (!btn || !dropdown || !timeline) return;
  
  // Toggle dropdown
  btn.addEventListener('click', () => {
    dropdown.classList.toggle('open');
  });
  
  // Close on click outside
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target as Node)) {
      dropdown.classList.remove('open');
    }
  });
  
  // Feature data - will be loaded from tracking/epics.json later
  const features = [
    { id: 1, name: 'Camera & Navigation', status: 'in-progress', version: 'v0.1', progress: 25, active: true },
    { id: 2, name: 'Environment Editing', status: 'todo', version: '-', progress: 0, active: true },
    { id: 3, name: 'Object Editing', status: 'todo', version: '-', progress: 0, active: true },
    { id: 4, name: 'Format Abstraction', status: 'todo', version: '-', progress: 0, active: false },
    { id: 5, name: 'World Modeling', status: 'todo', version: '-', progress: 0, active: false },
    { id: 6, name: 'Reality Anchoring', status: 'todo', version: '-', progress: 0, active: false },
    { id: 7, name: 'Remote Control', status: 'todo', version: '-', progress: 0, active: false },
    { id: 8, name: 'Output & Robotics', status: 'todo', version: '-', progress: 0, active: false },
    { id: 9, name: 'Simulation Training', status: 'todo', version: '-', progress: 0, active: false },
    { id: 10, name: 'Robot Integration', status: 'todo', version: '-', progress: 0, active: false },
  ];
  
  timeline.innerHTML = features.map(feature => `
    <div class="feature-item ${feature.active ? 'active' : ''}" data-feature-id="${feature.id}">
      <div class="feature-header">
        <span class="feature-id">${feature.id}</span>
        <span class="feature-status ${feature.status}"></span>
      </div>
      <div class="feature-name">${feature.name}</div>
      <div class="feature-progress">
        <div class="feature-progress-bar" style="width: ${feature.progress}%"></div>
      </div>
      <div class="feature-meta">
        <span class="feature-version">${feature.version}</span>
        <div class="feature-switch ${feature.active ? 'active' : ''}" data-feature-id="${feature.id}"></div>
      </div>
    </div>
  `).join('');
  
  // Toggle active/inactive modules
  timeline.querySelectorAll('.feature-switch').forEach(sw => {
    sw.addEventListener('click', (e) => {
      e.stopPropagation();
      sw.classList.toggle('active');
      const item = sw.closest('.feature-item');
      if (item) {
        item.classList.toggle('active');
      }
      const featureId = (sw as HTMLElement).dataset.featureId;
      const active = sw.classList.contains('active');
      console.log(`Feature ${featureId} ${active ? 'enabled' : 'disabled'}`);
    });
  });
}

function initTheme() {
  // Check for saved preferences
  const savedTheme = localStorage.getItem('saw-theme');
  const savedGlass = localStorage.getItem('saw-glass');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');
  const glass = savedGlass === 'true';
  
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.setAttribute('data-glass', String(glass));
  
  // Get view menu options
  const glassOption = document.getElementById('glass-option');
  const themeOption = document.getElementById('theme-option');
  
  // Set initial states
  if (glass && glassOption) {
    glassOption.classList.add('active');
  }
  if (theme === 'light' && themeOption) {
    themeOption.classList.add('active');
  }
  
  // Glass toggle
  if (glassOption) {
    glassOption.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-glass') === 'true';
      const next = !current;
      document.documentElement.setAttribute('data-glass', String(next));
      localStorage.setItem('saw-glass', String(next));
      glassOption.classList.toggle('active', next);
    });
  }
  
  // Theme toggle
  if (themeOption) {
    themeOption.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('saw-theme', next);
      themeOption.classList.toggle('active', next === 'light');
      
      // Dispatch event for viewport background update
      window.dispatchEvent(new CustomEvent('theme-change', { detail: { theme: next } }));
    });
  }
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('saw-theme')) {
      const theme = e.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
      if (themeOption) {
        themeOption.classList.toggle('active', theme === 'light');
      }
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
