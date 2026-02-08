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
  
  // Initialize create panel
  initCreatePanel();
  
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
    messages!.appendChild(msg);
    messages!.scrollTop = messages!.scrollHeight;
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
  const dropdownContent = document.getElementById('features-dropdown');
  
  if (!btn || !dropdown || !timeline || !dropdownContent) return;
  
  // Toggle dropdown
  btn.addEventListener('click', () => {
    dropdown.classList.toggle('open');
    // Close detail panel when closing dropdown
    if (!dropdown.classList.contains('open')) {
      closeFeatureDetail();
    }
  });
  
  // Close on click outside
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target as Node)) {
      dropdown.classList.remove('open');
      closeFeatureDetail();
    }
  });
  
  const REPO_URL = 'https://github.com/ironandsilk/SAW';
  
  // Feature data with epics and stories
  const features = [
    { 
      id: 1, 
      name: 'Camera & Navigation', 
      status: 'in-progress', 
      version: 'v0.1', 
      progress: 25, 
      active: true,
      branch: 'main',
      commit: '9d6deef',
      epics: [
        { 
          id: '1.1', 
          name: 'Camera System', 
          progress: 50,
          stories: [
            { name: 'Implement free camera with Bryce-style movement', status: 'done' },
            { name: 'Add camera presets (top, front, side, perspective)', status: 'done' },
            { name: 'Support camera bookmarks / saved views', status: 'todo' },
            { name: 'Implement smooth transitions between camera states', status: 'todo' },
          ]
        },
        { 
          id: '1.2', 
          name: 'Viewport Controls', 
          progress: 0,
          stories: [
            { name: 'Multi-viewport support (single, split, quad)', status: 'todo' },
            { name: 'Viewport-specific render modes', status: 'todo' },
            { name: 'Grid and axis helpers with toggle', status: 'todo' },
          ]
        },
        { 
          id: '1.3', 
          name: 'Autonomous Camera Adaptation', 
          progress: 0,
          stories: [
            { name: 'Agent-driven fly/orbit mode switching', status: 'todo' },
            { name: 'Auto-framing on points of interest', status: 'todo' },
          ]
        },
        { 
          id: '1.4', 
          name: 'Input Abstraction', 
          progress: 0,
          stories: [
            { name: 'Mouse/keyboard camera controls', status: 'todo' },
            { name: 'Voice commands for camera', status: 'todo' },
            { name: 'Gesture input (hand tracking)', status: 'todo' },
          ]
        },
      ]
    },
    { 
      id: 2, 
      name: 'Environment Editing', 
      status: 'todo', 
      version: '-', 
      progress: 0, 
      active: true,
      branch: null,
      commit: null,
      epics: [
        { id: '2.1', name: 'Scene Hierarchy', progress: 0, stories: [
          { name: 'Implement scene graph data structure', status: 'todo' },
          { name: 'Scene tree UI with expand/collapse', status: 'todo' },
          { name: 'Drag-and-drop reparenting', status: 'todo' },
        ]},
        { id: '2.2', name: 'Scene List', progress: 0, stories: [] },
        { id: '2.3', name: 'Environment Properties', progress: 0, stories: [] },
      ]
    },
    { id: 3, name: 'Object Editing', status: 'todo', version: '-', progress: 0, active: true, branch: null, commit: null, epics: [
      { id: '3.1', name: 'Object Hierarchy', progress: 0, stories: [] },
      { id: '3.2', name: 'Transform Tools', progress: 0, stories: [] },
      { id: '3.3', name: 'Object Properties Panel', progress: 0, stories: [] },
    ]},
    { id: 4, name: 'Format Abstraction', status: 'todo', version: '-', progress: 0, active: false, branch: null, commit: null, epics: [
      { id: '4.1', name: 'Import Pipeline - 3D Formats', progress: 0, stories: [] },
      { id: '4.2', name: 'Import Pipeline - CAD Formats', progress: 0, stories: [] },
      { id: '4.3', name: 'Export Pipeline', progress: 0, stories: [] },
    ]},
    { id: 5, name: 'World Modeling', status: 'todo', version: '-', progress: 0, active: false, branch: null, commit: null, epics: [
      { id: '5.1', name: 'Threshold System', progress: 0, stories: [] },
      { id: '5.2', name: 'World Model Abstraction', progress: 0, stories: [] },
      { id: '5.3', name: 'Vision Pipeline Hooks', progress: 0, stories: [] },
    ]},
    { id: 6, name: 'Reality Anchoring', status: 'todo', version: '-', progress: 0, active: false, branch: null, commit: null, epics: [
      { id: '6.1', name: 'Reality Capture', progress: 0, stories: [] },
      { id: '6.2', name: 'Scan & Reconstruction', progress: 0, stories: [] },
      { id: '6.3', name: 'Geospatial Anchoring', progress: 0, stories: [] },
    ]},
    { id: 7, name: 'Remote Control', status: 'todo', version: '-', progress: 0, active: false, branch: null, commit: null, epics: [
      { id: '7.1', name: 'Control Mode System', progress: 0, stories: [] },
      { id: '7.2', name: 'Remote Input Pipeline', progress: 0, stories: [] },
      { id: '7.3', name: 'Agent Hierarchy Extension', progress: 0, stories: [] },
    ]},
    { id: 8, name: 'Output & Robotics', status: 'todo', version: '-', progress: 0, active: false, branch: null, commit: null, epics: [
      { id: '8.1', name: 'Scene Serialization', progress: 0, stories: [] },
      { id: '8.2', name: 'Robotics Abstraction', progress: 0, stories: [] },
      { id: '8.3', name: 'Output Integration', progress: 0, stories: [] },
    ]},
    { id: 9, name: 'Simulation Training', status: 'todo', version: '-', progress: 0, active: false, branch: null, commit: null, epics: [
      { id: '9.1', name: 'Training Environment', progress: 0, stories: [] },
      { id: '9.2', name: 'VLA Policy Integration', progress: 0, stories: [] },
      { id: '9.3', name: 'Sim-to-Real Transfer', progress: 0, stories: [] },
    ]},
    { id: 10, name: 'Robot Integration', status: 'todo', version: '-', progress: 0, active: false, branch: null, commit: null, epics: [
      { id: '10.1', name: 'Single Robot Connection', progress: 0, stories: [] },
      { id: '10.2', name: 'Robot Farms', progress: 0, stories: [] },
    ]},
  ];
  
  // Create detail panel
  let detailPanel = document.getElementById('feature-detail');
  if (!detailPanel) {
    detailPanel = document.createElement('div');
    detailPanel.id = 'feature-detail';
    detailPanel.className = 'feature-detail';
    dropdownContent.appendChild(detailPanel);
  }
  
  function closeFeatureDetail() {
    detailPanel!.classList.remove('open');
    timeline!.querySelectorAll('.feature-item').forEach(item => {
      item.classList.remove('selected');
    });
  }
  
  function showFeatureDetail(featureId: number) {
    const feature = features.find(f => f.id === featureId);
    if (!feature) return;
    
    // Mark selected
    timeline!.querySelectorAll('.feature-item').forEach(item => {
      item.classList.remove('selected');
    });
    timeline!.querySelector(`[data-feature-id="${featureId}"]`)?.classList.add('selected');
    
    // Build detail content
    const epicCount = feature.epics.length;
    const storyCount = feature.epics.reduce((sum, e) => sum + e.stories.length, 0);
    const doneCount = feature.epics.reduce((sum, e) => sum + e.stories.filter(s => s.status === 'done').length, 0);
    
    detailPanel!.innerHTML = `
      <div class="detail-header">
        <div class="detail-title">
          <span class="detail-id">${feature.id}</span>
          <span class="detail-name">${feature.name}</span>
        </div>
        <button class="detail-close" id="detail-close">x</button>
      </div>
      <div class="detail-meta">
        <span class="detail-stat">${epicCount} epics</span>
        <span class="detail-stat">${doneCount}/${storyCount} stories</span>
        <span class="detail-version">${feature.version}</span>
        ${feature.branch || feature.commit ? `
          <div class="detail-git">
            ${feature.branch ? `
              <a href="${REPO_URL}/tree/${feature.branch}" target="_blank" class="detail-git-link" title="View branch">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 3v12"/>
                  <circle cx="6" cy="18" r="3"/>
                  <circle cx="6" cy="6" r="3"/>
                  <path d="M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                  <path d="M6 9c0 3 2 6 6 6s6-3 6-6"/>
                </svg>
                ${feature.branch}
              </a>
            ` : ''}
            ${feature.commit ? `
              <a href="${REPO_URL}/commit/${feature.commit}" target="_blank" class="detail-git-link" title="View commit">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="4"/>
                  <path d="M12 2v6M12 16v6"/>
                </svg>
                ${feature.commit}
              </a>
            ` : ''}
          </div>
        ` : ''}
      </div>
      <div class="detail-epics">
        ${feature.epics.map(epic => `
          <div class="detail-epic">
            <div class="epic-header">
              <span class="epic-id">${epic.id}</span>
              <span class="epic-name">${epic.name}</span>
              <div class="epic-progress-bar">
                <div class="epic-progress-fill" style="width: ${epic.progress}%"></div>
              </div>
            </div>
            ${epic.stories.length ? `
              <div class="epic-stories">
                ${epic.stories.map(story => `
                  <div class="story-item ${story.status}">
                    <span class="story-check">${story.status === 'done' ? '&#10003;' : '&#9675;'}</span>
                    <span class="story-name">${story.name}</span>
                  </div>
                `).join('')}
              </div>
            ` : '<div class="epic-stories-empty">No stories defined yet</div>'}
          </div>
        `).join('')}
      </div>
    `;
    
    // Close button
    document.getElementById('detail-close')?.addEventListener('click', (e) => {
      e.stopPropagation();
      closeFeatureDetail();
    });
    
    detailPanel!.classList.add('open');
  }
  
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
        ${feature.branch ? `<a href="${REPO_URL}/tree/${feature.branch}" target="_blank" class="feature-branch" onclick="event.stopPropagation()">${feature.branch}</a>` : `<span class="feature-version">${feature.version}</span>`}
        <div class="feature-switch ${feature.active ? 'active' : ''}" data-feature-id="${feature.id}"></div>
      </div>
    </div>
  `).join('');
  
  // Click feature to show detail
  timeline.querySelectorAll('.feature-item').forEach(item => {
    item.addEventListener('click', (e) => {
      // Don't trigger if clicking switch
      if ((e.target as HTMLElement).classList.contains('feature-switch')) return;
      
      const featureId = parseInt((item as HTMLElement).dataset.featureId || '0');
      showFeatureDetail(featureId);
    });
  });
  
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

function initCreatePanel() {
  const createBtn = document.getElementById('create-btn');
  const dropdown = createBtn?.closest('.nav-dropdown');
  const panel = document.getElementById('create-panel');
  const modeToggle = document.getElementById('create-mode-toggle');
  
  if (!createBtn || !dropdown || !panel || !modeToggle) return;
  
  const savedMode = localStorage.getItem('saw-create-mode');
  // Only two modes now: dropdown (HTML) or 3D (scene dish)
  let is3DMode = savedMode === '3d' || savedMode === 'radial'; // treat radial as 3D now
  
  // Toggle dropdown (depends on mode)
  createBtn.addEventListener('click', () => {
    if (is3DMode) {
      // In 3D mode, toggle 3D dish menu in viewport
      window.dispatchEvent(new CustomEvent('toggle-3d-create-menu'));
    } else {
      dropdown.classList.toggle('open');
    }
  });
  
  // Close on click outside (dropdown mode only)
  document.addEventListener('click', (e) => {
    if (!is3DMode && !dropdown.contains(e.target as Node)) {
      dropdown.classList.remove('open');
    }
  });
  
  // Mode toggle - cycles: dropdown <-> 3D
  modeToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    
    if (!is3DMode) {
      // dropdown -> 3D
      is3DMode = true;
      localStorage.setItem('saw-create-mode', '3d');
      dropdown.classList.remove('open');
      // Show 3D menu
      window.dispatchEvent(new CustomEvent('toggle-3d-create-menu'));
    } else {
      // 3D -> dropdown
      is3DMode = false;
      localStorage.setItem('saw-create-mode', 'dropdown');
      // Hide 3D menu
      window.dispatchEvent(new CustomEvent('hide-3d-create-menu'));
      dropdown.classList.add('open');
    }
  });
  
  // Tab switching
  panel.querySelectorAll('.create-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.stopPropagation();
      const tabId = (tab as HTMLElement).dataset.tab;
      
      // Update tab states
      panel.querySelectorAll('.create-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Show/hide content
      panel.querySelectorAll('.create-tab-content').forEach(content => {
        const contentId = (content as HTMLElement).dataset.tabContent;
        (content as HTMLElement).style.display = contentId === tabId ? 'flex' : 'none';
      });
    });
  });
  
  // Create item click handlers
  panel.querySelectorAll('.create-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const createType = (item as HTMLElement).dataset.create;
      const modelUrl = (item as HTMLElement).dataset.url;
      console.log(`Create: ${createType}`, modelUrl ? `URL: ${modelUrl}` : '');
      
      // Dispatch event for viewport to handle
      window.dispatchEvent(new CustomEvent('create-object', { 
        detail: { type: createType, url: modelUrl } 
      }));
      
      // Close panel after creation
      if (is3DMode) {
        // 3D mode closes via its own handler
      } else if (isRadialMode) {
        panel.style.display = 'none';
      } else {
        dropdown.classList.remove('open');
      }
    });
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
