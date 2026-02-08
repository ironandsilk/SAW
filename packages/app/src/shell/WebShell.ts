/**
 * Web Shell
 * 
 * Browser-based shell for SAW.
 * The spatial core is the same — this just provides the web-specific container.
 */

import type { IShell, DeviceClass, DisplayMetrics, Capabilities } from '@saw/core';

export class WebShell implements IShell {
  readonly deviceClass: DeviceClass = 'desktop';
  
  private canvas: HTMLCanvasElement;
  private container: HTMLElement;
  private resizeCallbacks: ((metrics: DisplayMetrics) => void)[] = [];
  private resizeObserver: ResizeObserver;
  
  constructor(container: HTMLElement) {
    this.container = container;
    
    // Create canvas
    this.canvas = document.createElement('canvas');
    container.appendChild(this.canvas);
    
    // Setup resize observer
    this.resizeObserver = new ResizeObserver(() => {
      const metrics = this.getDisplayMetrics();
      this.resizeCallbacks.forEach(cb => cb(metrics));
    });
    this.resizeObserver.observe(container);
  }
  
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }
  
  getDisplayMetrics(): DisplayMetrics {
    const rect = this.container.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
      pixelRatio: window.devicePixelRatio || 1,
      isImmersive: false,
    };
  }
  
  getCapabilities(): Capabilities {
    return {
      webgpu: 'gpu' in navigator,
      webxr: 'xr' in navigator,
      touch: 'ontouchstart' in window,
      gamepad: 'getGamepads' in navigator,
      spatialTracking: false,
    };
  }
  
  onResize(callback: (metrics: DisplayMetrics) => void): () => void {
    this.resizeCallbacks.push(callback);
    // Fire immediately
    callback(this.getDisplayMetrics());
    
    return () => {
      const idx = this.resizeCallbacks.indexOf(callback);
      if (idx >= 0) this.resizeCallbacks.splice(idx, 1);
    };
  }
  
  onFocus(callback: (focused: boolean) => void): () => void {
    const onFocus = () => callback(true);
    const onBlur = () => callback(false);
    
    window.addEventListener('focus', onFocus);
    window.addEventListener('blur', onBlur);
    
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('blur', onBlur);
    };
  }
  
  requestFrame(callback: (time: number, delta: number) => void): void {
    let lastTime = 0;
    
    const frame = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;
      callback(time, delta);
      requestAnimationFrame(frame);
    };
    
    requestAnimationFrame(frame);
  }
  
  dispose(): void {
    this.resizeObserver.disconnect();
    this.canvas.remove();
  }
}
