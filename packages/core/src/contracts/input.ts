/**
 * Input Contract
 * 
 * Input is abstracted so the same spatial actions work across devices.
 * Mouse orbit on desktop = hand gesture in headset = joystick on teleop.
 */

export type InputMode = 
  | 'mouse' 
  | 'touch' 
  | 'keyboard' 
  | 'gamepad' 
  | 'hand' 
  | 'gaze' 
  | 'voice'
  | 'teleop';

// Spatial navigation intents (device-agnostic)
export interface NavigationIntent {
  // Camera movement
  orbit?: { deltaX: number; deltaY: number };
  pan?: { deltaX: number; deltaY: number };
  dolly?: { delta: number };
  fly?: { direction: [number, number, number]; speed: number };
  
  // Instant jumps
  jumpToView?: 'top' | 'front' | 'side' | 'perspective';
  jumpToPosition?: [number, number, number];
  
  // Focus
  focusSelection?: boolean;
  focusPoint?: [number, number, number];
}

// Manipulation intents (device-agnostic)
export interface ManipulationIntent {
  select?: { screenX: number; screenY: number; additive: boolean };
  translate?: { axis: 'x' | 'y' | 'z' | 'free'; delta: [number, number, number] };
  rotate?: { axis: 'x' | 'y' | 'z' | 'free'; delta: [number, number, number] };
  scale?: { uniform: boolean; delta: [number, number, number] };
}

export interface IInputProvider {
  readonly supportedModes: InputMode[];
  readonly activeMode: InputMode;
  
  // Poll for navigation intent (called per frame)
  getNavigationIntent(): NavigationIntent | null;
  
  // Poll for manipulation intent
  getManipulationIntent(): ManipulationIntent | null;
  
  // Raw access when needed
  isKeyDown(key: string): boolean;
  isPointerDown(button: number): boolean;
  getPointerPosition(): { x: number; y: number } | null;
  
  dispose(): void;
}
