/**
 * Panel Contract
 * 
 * Panels overlay the spatial world.
 * They can be screen-anchored, world-anchored, or agent-relative.
 * UI can be diegetic (in-world), non-diegetic (overlay), or meta.
 */

export type PanelAnchor = 
  | { type: 'screen'; region: 'top' | 'bottom' | 'left' | 'right' | 'center' }
  | { type: 'floating'; x: number; y: number }
  | { type: 'world'; position: [number, number, number]; rotation?: [number, number, number, number] }
  | { type: 'camera-relative'; offset: [number, number, number] }
  | { type: 'agent-relative'; agentId: string; offset: [number, number, number] };

export type UIDiegesis = 
  | 'diegetic'      // Part of the world (in-world screen, hologram)
  | 'non-diegetic'  // Traditional overlay (HUD, menus)
  | 'meta'          // Aware of being UI (debug, editor chrome)
  | 'spatial';      // Exists in 3D space but not "in-world" (floating panel)

export interface PanelConfig {
  id: string;
  name: string;
  anchor: PanelAnchor;
  diegesis: UIDiegesis;
  
  // Dimensions (interpreted per anchor type)
  width: number | 'auto';
  height: number | 'auto';
  
  // Behavior
  visible: boolean;
  collapsible: boolean;
  closable: boolean;
  resizable: boolean;
  draggable: boolean;
  
  // Rendering
  opacity: number;
  className?: string;
}

export interface IPanel {
  readonly config: PanelConfig;
  
  // Lifecycle
  mount(container: HTMLElement | null, worldAnchor?: unknown): void;
  unmount(): void;
  
  // Updates
  updateConfig(updates: Partial<PanelConfig>): void;
  
  // Render (called per frame for world-anchored panels)
  render(): void;
}

export interface IPanelRegistry {
  register(panelType: string, factory: () => IPanel): void;
  create(panelType: string, config: Partial<PanelConfig>): IPanel;
  get(id: string): IPanel | null;
  getAll(): IPanel[];
  remove(id: string): void;
}
