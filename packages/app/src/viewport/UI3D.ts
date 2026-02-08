/**
 * 3D UI System
 * 
 * UI elements rendered in the 3D scene.
 * Body-locked = attached to camera, follows user.
 * World-locked = fixed in world space.
 */

import * as THREE from 'three';

export interface DishMenuItem {
  id: string;
  label: string;
  icon?: string;
  color?: number;
}

export class DishMenu3D {
  readonly group: THREE.Group;
  
  private camera: THREE.PerspectiveCamera;
  private items: THREE.Mesh[] = [];
  private labels: THREE.Sprite[] = [];
  private dishBase: THREE.Mesh;
  private raycaster = new THREE.Raycaster();
  private hoveredItem: THREE.Mesh | null = null;
  
  private isVisible = false;
  private menuItems: DishMenuItem[] = [];
  private onSelect: ((id: string) => void) | null = null;
  
  // Body-locked positioning
  private offsetY = -0.8;  // Below eye level
  private offsetZ = -1.5;  // In front of camera
  private dishRadius = 0.6;
  private dishArc = Math.PI * 0.6; // 108 degrees arc
  
  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.group = new THREE.Group();
    this.group.visible = false;
    
    // Create dish base (half-dome)
    this.dishBase = this.createDishBase();
    this.group.add(this.dishBase);
  }
  
  private createDishBase(): THREE.Mesh {
    // Create a partial sphere (dish shape)
    const geometry = new THREE.SphereGeometry(
      this.dishRadius * 1.2, 
      32, 
      16, 
      0, 
      Math.PI * 2, 
      Math.PI * 0.5, 
      Math.PI * 0.3
    );
    
    const material = new THREE.MeshStandardMaterial({
      color: 0x1a1a1e,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      metalness: 0.3,
      roughness: 0.7,
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = Math.PI; // Flip to face up
    
    return mesh;
  }
  
  setItems(items: DishMenuItem[], onSelect: (id: string) => void) {
    this.menuItems = items;
    this.onSelect = onSelect;
    this.rebuildItems();
  }
  
  private rebuildItems() {
    // Clear existing items
    this.items.forEach(item => {
      this.group.remove(item);
      item.geometry.dispose();
      (item.material as THREE.Material).dispose();
    });
    this.labels.forEach(label => {
      this.group.remove(label);
      (label.material as THREE.SpriteMaterial).dispose();
    });
    this.items = [];
    this.labels = [];
    
    // Create new items in arc
    const count = this.menuItems.length;
    const startAngle = -this.dishArc / 2;
    const angleStep = this.dishArc / Math.max(count - 1, 1);
    
    this.menuItems.forEach((menuItem, i) => {
      const angle = count === 1 ? 0 : startAngle + angleStep * i;
      const x = Math.sin(angle) * this.dishRadius * 0.8;
      const z = Math.cos(angle) * this.dishRadius * 0.3 - this.dishRadius * 0.3;
      const y = 0.08 + Math.cos(angle * 0.5) * 0.05; // Slight arc up
      
      // Create item button
      const geometry = new THREE.CylinderGeometry(0.06, 0.06, 0.02, 16);
      const material = new THREE.MeshStandardMaterial({
        color: menuItem.color || 0x4a9eff,
        metalness: 0.5,
        roughness: 0.3,
        emissive: menuItem.color || 0x4a9eff,
        emissiveIntensity: 0.1,
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      mesh.rotation.x = -Math.PI * 0.3; // Tilt toward camera
      mesh.userData = { menuItemId: menuItem.id, originalColor: menuItem.color || 0x4a9eff };
      
      this.items.push(mesh);
      this.group.add(mesh);
      
      // Create label sprite
      const label = this.createLabel(menuItem.label);
      label.position.set(x, y + 0.12, z);
      label.visible = false; // Show on hover
      this.labels.push(label);
      this.group.add(label);
    });
  }
  
  private createLabel(text: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = 256;
    canvas.height = 64;
    
    ctx.fillStyle = 'rgba(26, 26, 30, 0.9)';
    ctx.roundRect(0, 0, canvas.width, canvas.height, 8);
    ctx.fill();
    
    ctx.fillStyle = '#e0e0e0';
    ctx.font = 'bold 24px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ 
      map: texture, 
      transparent: true,
    });
    
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(0.25, 0.0625, 1);
    
    return sprite;
  }
  
  show() {
    this.isVisible = true;
    this.group.visible = true;
  }
  
  hide() {
    this.isVisible = false;
    this.group.visible = false;
  }
  
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }
  
  /**
   * Update position to follow camera (body-locked)
   */
  update() {
    if (!this.isVisible) return;
    
    // Get camera world position and direction
    const cameraPos = new THREE.Vector3();
    const cameraDir = new THREE.Vector3();
    this.camera.getWorldPosition(cameraPos);
    this.camera.getWorldDirection(cameraDir);
    
    // Position dish in front and below camera
    const right = new THREE.Vector3();
    right.crossVectors(this.camera.up, cameraDir).normalize();
    
    const dishPos = cameraPos.clone()
      .add(cameraDir.multiplyScalar(-this.offsetZ))
      .add(new THREE.Vector3(0, this.offsetY, 0));
    
    this.group.position.copy(dishPos);
    
    // Make dish face camera (only Y rotation)
    const lookTarget = cameraPos.clone();
    lookTarget.y = dishPos.y;
    this.group.lookAt(lookTarget);
  }
  
  /**
   * Check for mouse/pointer interaction
   */
  checkInteraction(mouse: THREE.Vector2): string | null {
    if (!this.isVisible) return null;
    
    this.raycaster.setFromCamera(mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.items);
    
    // Reset previous hover
    if (this.hoveredItem) {
      const mat = this.hoveredItem.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.1;
      const idx = this.items.indexOf(this.hoveredItem);
      if (idx >= 0 && this.labels[idx]) {
        this.labels[idx].visible = false;
      }
      this.hoveredItem = null;
    }
    
    if (intersects.length > 0) {
      const item = intersects[0].object as THREE.Mesh;
      if (item.userData.menuItemId) {
        this.hoveredItem = item;
        const mat = item.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = 0.5;
        
        // Show label
        const idx = this.items.indexOf(item);
        if (idx >= 0 && this.labels[idx]) {
          this.labels[idx].visible = true;
        }
        
        return item.userData.menuItemId;
      }
    }
    
    return null;
  }
  
  /**
   * Handle click
   */
  handleClick(mouse: THREE.Vector2): boolean {
    const id = this.checkInteraction(mouse);
    if (id && this.onSelect) {
      this.onSelect(id);
      this.hide();
      return true;
    }
    return false;
  }
  
  /**
   * Set glass mode (more transparent)
   */
  setGlassMode(enabled: boolean) {
    const mat = this.dishBase.material as THREE.MeshStandardMaterial;
    if (enabled) {
      mat.opacity = 0.6;
      mat.color.setHex(0x2a2a30);
    } else {
      mat.opacity = 0.85;
      mat.color.setHex(0x1a1a1e);
    }
  }
  
  dispose() {
    this.dishBase.geometry.dispose();
    (this.dishBase.material as THREE.Material).dispose();
    
    this.items.forEach(item => {
      item.geometry.dispose();
      (item.material as THREE.Material).dispose();
    });
    
    this.labels.forEach(label => {
      (label.material as THREE.SpriteMaterial).map?.dispose();
      (label.material as THREE.SpriteMaterial).dispose();
    });
  }
}
