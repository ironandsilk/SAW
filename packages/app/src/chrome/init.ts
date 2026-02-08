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
  
  // Populate hierarchy (placeholder)
  const hierarchy = document.getElementById('hierarchy');
  if (hierarchy) {
    hierarchy.innerHTML = `
      <div class="tree-item">
        <span class="tree-icon">📁</span>
        <span class="tree-label">Scene</span>
      </div>
      <div class="tree-item" style="padding-left: 16px;">
        <span class="tree-icon">💡</span>
        <span class="tree-label">Lights</span>
      </div>
      <div class="tree-item" style="padding-left: 16px;">
        <span class="tree-icon">📦</span>
        <span class="tree-label">Box</span>
      </div>
      <div class="tree-item" style="padding-left: 16px;">
        <span class="tree-icon">🔵</span>
        <span class="tree-label">Sphere</span>
      </div>
      <div class="tree-item" style="padding-left: 16px;">
        <span class="tree-icon">🔷</span>
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
  
  // Add chrome-specific styles
  addChromeStyles();
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
