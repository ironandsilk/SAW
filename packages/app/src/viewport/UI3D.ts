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
  url?: string;
  category?: string;
}

export interface DishMenuCategory {
  id: string;
  label: string;
  items: DishMenuItem[];
}

export class DishMenu3D {
  readonly group: THREE.Group;
  
  private camera: THREE.PerspectiveCamera;
  private items: THREE.Mesh[] = [];
  private labels: THREE.Sprite[] = [];
  private dishBase: THREE.Mesh;
  private centerToggle: THREE.Mesh | null = null;
  private centerLabel: THREE.Sprite | null = null;
  private raycaster = new THREE.Raycaster();
  private hoveredItem: THREE.Mesh | null = null;
  
  private isVisible = false;
  private categories: DishMenuCategory[] = [];
  private currentCategoryIndex = 0;
  private onSelect: ((id: string, url?: string) => void) | null = null;
  
  // Body-locked positioning (attached below camera, looking down at it)
  private offsetY = -0.18;  // Below eye level (closer to bottom third of view)
  private offsetZ = 1.5;    // Distance in front of camera (push it out more)
  private tiltAngle = Math.PI * 0.5; // Tilt dish toward user (more = faces up more)
  private dishRadius = 0.2;  // Compact dish
  private dishArc = Math.PI * 0.85; // ~153 degrees arc
  
  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.group = new THREE.Group();
    this.group.visible = false;
    
    // Create dish base (half-dome)
    this.dishBase = this.createDishBase();
    this.group.add(this.dishBase);
  }
  
  private createDishBase(): THREE.Mesh {
    // Create a shallow dish/tray shape
    const geometry = new THREE.CylinderGeometry(
      this.dishRadius * 1.1,   // top radius
      this.dishRadius * 1.3,   // bottom radius (slightly larger = dish shape)
      0.05,                     // height (thin)
      32,                       // radial segments
      1,                        // height segments
      false                     // open ended
    );
    
    const material = new THREE.MeshStandardMaterial({
      color: 0x1a1a1e,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      metalness: 0.4,
      roughness: 0.6,
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    
    return mesh;
  }
  
  setCategories(categories: DishMenuCategory[], onSelect: (id: string, url?: string) => void) {
    this.categories = categories;
    this.onSelect = onSelect;
    this.currentCategoryIndex = 0;
    this.rebuildItems();
  }
  
  // Legacy support
  setItems(items: DishMenuItem[], onSelect: (id: string) => void) {
    this.setCategories([{ id: 'default', label: 'Items', items }], onSelect);
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
    if (this.centerToggle) {
      this.group.remove(this.centerToggle);
      this.centerToggle.geometry.dispose();
      (this.centerToggle.material as THREE.Material).dispose();
      this.centerToggle = null;
    }
    if (this.centerLabel) {
      this.group.remove(this.centerLabel);
      (this.centerLabel.material as THREE.SpriteMaterial).dispose();
      this.centerLabel = null;
    }
    this.items = [];
    this.labels = [];
    
    if (this.categories.length === 0) return;
    
    const currentCategory = this.categories[this.currentCategoryIndex];
    const menuItems = currentCategory.items;
    
    // Create center toggle if multiple categories
    if (this.categories.length > 1) {
      const toggleGeo = new THREE.SphereGeometry(0.06, 16, 16);
      const toggleMat = new THREE.MeshStandardMaterial({
        color: 0xff8c42,
        metalness: 0.6,
        roughness: 0.2,
        emissive: 0xff8c42,
        emissiveIntensity: 0.3,
      });
      this.centerToggle = new THREE.Mesh(toggleGeo, toggleMat);
      this.centerToggle.position.set(0, 0.06, 0);
      this.centerToggle.userData = { isCategoryToggle: true };
      this.group.add(this.centerToggle);
      
      // Center label showing current category
      this.centerLabel = this.createLabel(currentCategory.label);
      this.centerLabel.position.set(0, 0.15, 0);
      this.centerLabel.visible = true;
      this.group.add(this.centerLabel);
    }
    
    // Create new items in arc on the dish surface
    const count = menuItems.length;
    const startAngle = -this.dishArc / 2;
    const angleStep = this.dishArc / Math.max(count - 1, 1);
    const itemRadius = this.dishRadius * 0.75; // Place items within dish
    
    menuItems.forEach((menuItem, i) => {
      const angle = count === 1 ? 0 : startAngle + angleStep * i;
      
      // Position in a semicircle on the dish surface
      const x = Math.sin(angle) * itemRadius;
      const z = -Math.cos(angle) * itemRadius * 0.5; // Compress Z for dish shape
      const y = 0.05; // Sit on top of dish
      
      // Create item button (sphere for better visibility)
      const geometry = new THREE.SphereGeometry(0.045, 16, 16);
      const material = new THREE.MeshStandardMaterial({
        color: menuItem.color || 0x4a9eff,
        metalness: 0.5,
        roughness: 0.3,
        emissive: menuItem.color || 0x4a9eff,
        emissiveIntensity: 0.2,
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      mesh.userData = { menuItemId: menuItem.id, url: menuItem.url, originalColor: menuItem.color || 0x4a9eff };
      
      this.items.push(mesh);
      this.group.add(mesh);
      
      // Create label sprite (above the item)
      const label = this.createLabel(menuItem.label);
      label.position.set(x, y + 0.1, z);
      label.visible = false; // Show on hover
      this.labels.push(label);
      this.group.add(label);
    });
  }
  
  private nextCategory() {
    this.currentCategoryIndex = (this.currentCategoryIndex + 1) % this.categories.length;
    this.rebuildItems();
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
   * Dish is attached below the camera like a tray at chest level
   */
  update() {
    if (!this.isVisible) return;
    
    // Get camera world position and direction
    const cameraPos = new THREE.Vector3();
    const cameraDir = new THREE.Vector3();
    this.camera.getWorldPosition(cameraPos);
    this.camera.getWorldDirection(cameraDir);
    
    // Get camera's local axes
    const cameraRight = new THREE.Vector3();
    const cameraUp = new THREE.Vector3();
    this.camera.matrixWorld.extractBasis(cameraRight, cameraUp, new THREE.Vector3());
    
    // Position dish in camera space:
    // - Forward along camera direction
    // - Down from camera position
    const dishPos = cameraPos.clone()
      .addScaledVector(cameraDir, this.offsetZ)      // Forward
      .addScaledVector(cameraUp, this.offsetY);       // Down (negative)
    
    this.group.position.copy(dishPos);
    
    // Orient dish to face upward toward camera
    // First, align with camera's forward direction (Y rotation)
    this.group.quaternion.copy(this.camera.quaternion);
    
    // Then tilt it to face the user (like looking down at a tray)
    const tiltQuat = new THREE.Quaternion();
    tiltQuat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.tiltAngle);
    this.group.quaternion.multiply(tiltQuat);
  }
  
  /**
   * Check for mouse/pointer interaction
   */
  checkInteraction(mouse: THREE.Vector2): string | null {
    if (!this.isVisible) return null;
    
    this.raycaster.setFromCamera(mouse, this.camera);
    
    // Check items and center toggle
    const allInteractable = [...this.items];
    if (this.centerToggle) allInteractable.push(this.centerToggle);
    
    const intersects = this.raycaster.intersectObjects(allInteractable);
    
    // Reset previous hover
    if (this.hoveredItem) {
      const mat = this.hoveredItem.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = this.hoveredItem.userData.isCategoryToggle ? 0.2 : 0.1;
      const idx = this.items.indexOf(this.hoveredItem);
      if (idx >= 0 && this.labels[idx]) {
        this.labels[idx].visible = false;
      }
      this.hoveredItem = null;
    }
    
    if (intersects.length > 0) {
      const item = intersects[0].object as THREE.Mesh;
      
      // Center toggle hover
      if (item.userData.isCategoryToggle) {
        this.hoveredItem = item;
        const mat = item.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = 0.6;
        return '__toggle__';
      }
      
      // Item hover
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
    if (!this.isVisible) return false;
    
    this.raycaster.setFromCamera(mouse, this.camera);
    
    const allInteractable = [...this.items];
    if (this.centerToggle) allInteractable.push(this.centerToggle);
    
    const intersects = this.raycaster.intersectObjects(allInteractable);
    
    if (intersects.length > 0) {
      const item = intersects[0].object as THREE.Mesh;
      
      // Center toggle clicked - switch category
      if (item.userData.isCategoryToggle) {
        this.nextCategory();
        return true;
      }
      
      // Item clicked
      if (item.userData.menuItemId && this.onSelect) {
        this.onSelect(item.userData.menuItemId, item.userData.url);
        this.hide();
        return true;
      }
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
