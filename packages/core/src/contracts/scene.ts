/**
 * Scene Contract
 * 
 * The spatial world. This is THE interface.
 * Everything exists in this space — objects, agents, anchors.
 */

export interface Transform {
  position: [number, number, number];
  rotation: [number, number, number, number]; // quaternion
  scale: [number, number, number];
}

export interface SceneNode {
  id: string;
  name: string;
  type: string;
  transform: Transform;
  parentId: string | null;
  childIds: string[];
  visible: boolean;
  selectable: boolean;
  metadata: Record<string, unknown>;
}

export interface ISceneGraph {
  // Queries
  getRoot(): SceneNode;
  getNode(id: string): SceneNode | null;
  getChildren(id: string): SceneNode[];
  getParent(id: string): SceneNode | null;
  
  // Mutations
  addNode(node: Omit<SceneNode, 'id'>, parentId?: string): string;
  removeNode(id: string): void;
  updateNode(id: string, updates: Partial<SceneNode>): void;
  reparent(id: string, newParentId: string): void;
  
  // Selection
  getSelection(): string[];
  setSelection(ids: string[]): void;
  addToSelection(id: string): void;
  removeFromSelection(id: string): void;
  clearSelection(): void;
  
  // Serialization
  serialize(): string;
  deserialize(data: string): void;
}
