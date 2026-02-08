/**
 * Event Bus
 * 
 * Decoupled communication between modules.
 * Spatial events, input events, state changes — all flow through here.
 */

export type EventCallback<T = unknown> = (payload: T) => void;

interface Subscription {
  event: string;
  callback: EventCallback;
}

export class EventBus {
  private listeners = new Map<string, Set<EventCallback>>();
  private subscriptions = new WeakMap<object, Subscription[]>();

  /**
   * Subscribe to an event
   */
  on<T>(event: string, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as EventCallback);
    
    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Unsubscribe from an event
   */
  off<T>(event: string, callback: EventCallback<T>): void {
    this.listeners.get(event)?.delete(callback as EventCallback);
  }

  /**
   * Emit an event
   */
  emit<T>(event: string, payload: T): void {
    this.listeners.get(event)?.forEach(cb => {
      try {
        cb(payload);
      } catch (err) {
        console.error(`Error in event handler for "${event}":`, err);
      }
    });
  }

  /**
   * Subscribe multiple events, bound to an owner for easy cleanup
   */
  subscribe(owner: object, subscriptions: Record<string, EventCallback>): void {
    const subs: Subscription[] = [];
    
    for (const [event, callback] of Object.entries(subscriptions)) {
      this.on(event, callback);
      subs.push({ event, callback });
    }
    
    this.subscriptions.set(owner, subs);
  }

  /**
   * Unsubscribe all events for an owner
   */
  unsubscribe(owner: object): void {
    const subs = this.subscriptions.get(owner);
    if (subs) {
      for (const { event, callback } of subs) {
        this.off(event, callback);
      }
      this.subscriptions.delete(owner);
    }
  }

  /**
   * Clear all listeners
   */
  clear(): void {
    this.listeners.clear();
  }
}

// Singleton instance
export const bus = new EventBus();

// Common event types
export const Events = {
  // Scene
  SCENE_LOADED: 'scene:loaded',
  SCENE_CHANGED: 'scene:changed',
  SELECTION_CHANGED: 'selection:changed',
  
  // Navigation
  CAMERA_MOVED: 'camera:moved',
  VIEW_CHANGED: 'view:changed',
  
  // Input
  INPUT_MODE_CHANGED: 'input:mode:changed',
  
  // Panels
  PANEL_OPENED: 'panel:opened',
  PANEL_CLOSED: 'panel:closed',
  PANEL_MOVED: 'panel:moved',
  
  // System
  RESIZE: 'system:resize',
  FOCUS: 'system:focus',
  FRAME: 'system:frame',
} as const;
