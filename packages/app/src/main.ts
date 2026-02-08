/**
 * SAW — Main Entry
 * 
 * The spatial world is the interface.
 */

import { WebShell } from './shell/WebShell';
import { SpatialViewport } from './viewport/SpatialViewport';
import { BryceCamera } from './viewport/BryceCamera';
import { initChrome } from './chrome/init';

async function main() {
  // Create web shell
  const container = document.getElementById('viewport')!;
  const shell = new WebShell(container);
  
  // Create spatial viewport (THE core)
  const viewport = new SpatialViewport(shell);
  
  // Create Bryce-style camera controller
  const camera = new BryceCamera(viewport.camera, container);
  
  // Initialize chrome (panels, controls, status)
  initChrome(viewport, camera);
  
  // Add some test geometry
  viewport.addTestScene();
  
  // Start the loop
  let lastTime = 0;
  
  function frame(time: number) {
    const delta = (time - lastTime) / 1000;
    lastTime = time;
    
    // Update camera
    camera.update(delta);
    
    // Update status
    updateStatus(viewport, camera, delta);
    
    // Render
    viewport.render();
    
    requestAnimationFrame(frame);
  }
  
  requestAnimationFrame(frame);
  
  console.log('SAW initialized — spatial editing is the core');
}

function updateStatus(viewport: SpatialViewport, camera: BryceCamera, delta: number) {
  const fps = Math.round(1 / delta);
  const pos = camera.getPosition();
  
  document.getElementById('fps')!.textContent = `${fps} FPS`;
  document.getElementById('position')!.textContent = 
    `X: ${pos.x.toFixed(2)} Y: ${pos.y.toFixed(2)} Z: ${pos.z.toFixed(2)}`;
}

main().catch(console.error);
