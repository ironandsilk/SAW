/**
 * Shell Contract
 * 
 * Shells provide the device-specific container for SAW.
 * The spatial core is the same — shells just change how you move through it.
 */

export type DeviceClass = 
  | 'desktop' 
  | 'mobile' 
  | 'tablet' 
  | 'headset' 
  | 'robot' 
  | 'embedded';

export interface DisplayMetrics {
  width: number;
  height: number;
  pixelRatio: number;
  isImmersive: boolean;
}

export interface Capabilities {
  webgpu: boolean;
  webxr: boolean;
  touch: boolean;
  gamepad: boolean;
  spatialTracking: boolean;
}

export interface IShell {
  readonly deviceClass: DeviceClass;
  
  // Display
  getCanvas(): HTMLCanvasElement;
  getDisplayMetrics(): DisplayMetrics;
  
  // Capabilities
  getCapabilities(): Capabilities;
  
  // Lifecycle
  onResize(callback: (metrics: DisplayMetrics) => void): () => void;
  onFocus(callback: (focused: boolean) => void): () => void;
  
  // Frame loop
  requestFrame(callback: (time: number, delta: number) => void): void;
  
  dispose(): void;
}
