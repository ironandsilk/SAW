/**
 * Exocentric Camera Controller
 * 
 * "Step outside yourself" — view and edit body-worn UI from third person.
 * Orbits around the user's viewpoint, showing the avatar/ghost and attached UI.
 */

import * as THREE from 'three';

export class ExocentricCamera {
  private camera: THREE.PerspectiveCamera;
  private container: HTMLElement;
  
  // The "user" position we orbit around (where ego camera was)
  private userPosition = new THREE.Vector3();
  private userDirection = new THREE.Vector3();
  
  // Exo orbit state
  private theta = Math.PI / 4;   // Horizontal angle
  private phi = Math.PI / 3;     // Vertical angle (looking down)
  private radius = 3;            // Distance from user
  
  // Input state
  private isDragging = false;
  private lastMouse = { x: 0, y: 0 };
  
  // Settings
  private orbitSpeed = 0.005;
  private dollySpeed = 0.1;
  private minRadius = 1;
  private maxRadius = 10;
  private minPhi = 0.2;
  private maxPhi = Math.PI * 0.8;
  
  // Ghost avatar to show user position
  private ghostGroup: THREE.Group;
  private ghostMesh: THREE.Mesh;
  private ghostDirection: THREE.ArrowHelper;
  
  private isActive = false;
  
  constructor(camera: THREE.PerspectiveCamera, container: HTMLElement, scene: THREE.Scene) {
    this.camera = camera;
    this.container = container;
    
    // Create ghost avatar
    this.ghostGroup = new THREE.Group();
    this.ghostGroup.visible = false;
    
    // Simple ghost body (capsule-like)
    const ghostGeo = new THREE.CapsuleGeometry(0.2, 0.5, 4, 8);
    const ghostMat = new THREE.MeshStandardMaterial({
      color: 0x4a9eff,
      transparent: true,
      opacity: 0.5,
      emissive: 0x4a9eff,
      emissiveIntensity: 0.2,
    });
    this.ghostMesh = new THREE.Mesh(ghostGeo, ghostMat);
    this.ghostMesh.position.y = 0.45;
    this.ghostGroup.add(this.ghostMesh);
    
    // Direction indicator
    this.ghostDirection = new THREE.ArrowHelper(
      new THREE.Vector3(0, 0, -1),
      new THREE.Vector3(0, 0.5, 0),
      0.8,
      0x4a9eff,
      0.2,
      0.1
    );
    this.ghostGroup.add(this.ghostDirection);
    
    scene.add(this.ghostGroup);
    
    this.bindEvents();
  }
  
  private bindEvents() {
    this.container.addEventListener('mousedown', this.onMouseDown);
    this.container.addEventListener('mousemove', this.onMouseMove);
    this.container.addEventListener('mouseup', this.onMouseUp);
    this.container.addEventListener('mouseleave', this.onMouseUp);
    this.container.addEventListener('wheel', this.onWheel, { passive: false });
  }
  
  private onMouseDown = (e: MouseEvent) => {
    if (!this.isActive) return;
    if (e.button === 0) {
      this.isDragging = true;
      this.lastMouse = { x: e.clientX, y: e.clientY };
    }
  };
  
  private onMouseMove = (e: MouseEvent) => {
    if (!this.isActive || !this.isDragging) return;
    
    const dx = e.clientX - this.lastMouse.x;
    const dy = e.clientY - this.lastMouse.y;
    
    this.theta -= dx * this.orbitSpeed;
    this.phi -= dy * this.orbitSpeed;
    this.phi = Math.max(this.minPhi, Math.min(this.maxPhi, this.phi));
    
    this.lastMouse = { x: e.clientX, y: e.clientY };
    this.updateCamera();
  };
  
  private onMouseUp = () => {
    this.isDragging = false;
  };
  
  private onWheel = (e: WheelEvent) => {
    if (!this.isActive) return;
    e.preventDefault();
    
    this.radius += e.deltaY * this.dollySpeed * 0.01;
    this.radius = Math.max(this.minRadius, Math.min(this.maxRadius, this.radius));
    this.updateCamera();
  };
  
  /**
   * Activate exocentric mode — capture current camera state as "user"
   */
  activate(currentPosition: THREE.Vector3, currentDirection: THREE.Vector3) {
    this.userPosition.copy(currentPosition);
    this.userDirection.copy(currentDirection);
    
    // Position ghost at user location
    this.ghostGroup.position.copy(this.userPosition);
    this.ghostGroup.position.y = 0; // Ground level
    
    // Orient ghost to face user's direction
    const angle = Math.atan2(currentDirection.x, currentDirection.z);
    this.ghostGroup.rotation.y = angle;
    
    this.ghostGroup.visible = true;
    this.isActive = true;
    
    // Start orbit from behind-and-above the user
    this.theta = angle + Math.PI;
    this.phi = Math.PI / 3;
    this.radius = 3;
    
    this.updateCamera();
  }
  
  /**
   * Deactivate exocentric mode
   */
  deactivate() {
    this.ghostGroup.visible = false;
    this.isActive = false;
  }
  
  /**
   * Update camera position based on orbit state
   */
  private updateCamera() {
    if (!this.isActive) return;
    
    // Spherical to Cartesian around user position
    const x = this.radius * Math.sin(this.phi) * Math.cos(this.theta);
    const y = this.radius * Math.cos(this.phi);
    const z = this.radius * Math.sin(this.phi) * Math.sin(this.theta);
    
    this.camera.position.set(
      this.userPosition.x + x,
      this.userPosition.y + y + 1, // Offset up from ground
      this.userPosition.z + z
    );
    
    // Look at user's head level
    const lookTarget = this.userPosition.clone();
    lookTarget.y += 1;
    this.camera.lookAt(lookTarget);
  }
  
  /**
   * Get current user position (for restoring ego camera)
   */
  getUserPosition(): THREE.Vector3 {
    return this.userPosition.clone();
  }
  
  getUserDirection(): THREE.Vector3 {
    return this.userDirection.clone();
  }
  
  isExoActive(): boolean {
    return this.isActive;
  }
  
  dispose() {
    this.container.removeEventListener('mousedown', this.onMouseDown);
    this.container.removeEventListener('mousemove', this.onMouseMove);
    this.container.removeEventListener('mouseup', this.onMouseUp);
    this.container.removeEventListener('wheel', this.onWheel);
    
    this.ghostMesh.geometry.dispose();
    (this.ghostMesh.material as THREE.Material).dispose();
  }
}
