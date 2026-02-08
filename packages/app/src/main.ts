/**
 * SAW — Main Entry
 * 
 * The spatial world is the interface.
 */

import * as THREE from 'three';
import { WebShell } from './shell/WebShell';
import { SpatialViewport } from './viewport/SpatialViewport';
import { BryceCamera } from './viewport/BryceCamera';
import { ExocentricCamera } from './viewport/ExocentricCamera';
import { initChrome } from './chrome/init';

async function main() {
  // Create web shell
  const container = document.getElementById('viewport')!;
  const shell = new WebShell(container);
  
  // Create spatial viewport (THE core)
  const viewport = new SpatialViewport(shell);
  
  // Create Bryce-style camera controller (egocentric — first person)
  const egoCamera = new BryceCamera(viewport.camera, container);
  
  // Create exocentric camera controller (third person — edit body-worn UI)
  const exoCamera = new ExocentricCamera(viewport.camera, container, viewport.scene);
  
  // Camera mode state
  let isExoMode = false;
  
  // Initialize chrome (panels, controls, status)
  initChrome(viewport, egoCamera);
  
  // Add some test geometry
  viewport.addTestScene();
  
  // Exo toggle button
  const exoToggle = document.getElementById('exo-toggle');
  if (exoToggle) {
    exoToggle.addEventListener('click', () => toggleExoMode());
  }
  
  // Keyboard shortcut (E key)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'e' || e.key === 'E') {
      if (document.activeElement?.tagName !== 'INPUT') {
        toggleExoMode();
      }
    }
  });
  
  function toggleExoMode() {
    isExoMode = !isExoMode;
    
    if (isExoMode) {
      // Capture current ego camera state and switch to exo
      const pos = viewport.camera.position.clone();
      const dir = new THREE.Vector3();
      viewport.camera.getWorldDirection(dir);
      
      exoCamera.activate(pos, dir);
      exoToggle?.classList.add('active');
      document.getElementById('mode-text')!.textContent = 'EXO';
    } else {
      // Return to ego mode
      exoCamera.deactivate();
      exoToggle?.classList.remove('active');
      document.getElementById('mode-text')!.textContent = 'EDIT';
      
      // Restore ego camera to user position
      // (Optional: could animate back)
    }
  }
  
  // Start the loop
  let lastTime = 0;
  
  function frame(time: number) {
    const delta = (time - lastTime) / 1000;
    lastTime = time;
    
    // Update active camera controller
    if (!isExoMode) {
      egoCamera.update(delta);
    }
    
    // Update status
    updateStatus(viewport, egoCamera, delta, isExoMode);
    
    // Render
    viewport.render();
    
    requestAnimationFrame(frame);
  }
  
  requestAnimationFrame(frame);
  
  console.log('SAW initialized — spatial editing is the core');
}

function updateStatus(viewport: SpatialViewport, camera: BryceCamera, delta: number, isExoMode: boolean) {
  const fps = Math.round(1 / delta);
  const pos = viewport.camera.position;
  
  document.getElementById('fps')!.textContent = `${fps} FPS`;
  document.getElementById('position')!.textContent = 
    `X: ${pos.x.toFixed(2)} Y: ${pos.y.toFixed(2)} Z: ${pos.z.toFixed(2)}`;
}

main().catch(console.error);
