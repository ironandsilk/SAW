/**
 * Bryce-style Camera Controller
 * 
 * Orbit, pan, dolly — the classic 3D navigation.
 * Input-agnostic design: today it's mouse, tomorrow it could be anything.
 */

import * as THREE from 'three';

interface CameraState {
  // Spherical coordinates for orbit
  theta: number;    // Horizontal angle
  phi: number;      // Vertical angle
  radius: number;   // Distance from target
  
  // Target point
  target: THREE.Vector3;
}

export class BryceCamera {
  private camera: THREE.PerspectiveCamera;
  private container: HTMLElement;
  
  private state: CameraState = {
    theta: Math.PI / 4,
    phi: Math.PI / 4,
    radius: 17,
    target: new THREE.Vector3(0, 0, 0),
  };
  
  // Input state
  private isDragging = false;
  private isPanning = false;
  private lastMouse = { x: 0, y: 0 };
  
  // Settings
  private orbitSpeed = 0.005;
  private panSpeed = 0.02;
  private dollySpeed = 0.1;
  private minRadius = 1;
  private maxRadius = 500;
  private minPhi = 0.1;
  private maxPhi = Math.PI - 0.1;
  
  constructor(camera: THREE.PerspectiveCamera, container: HTMLElement) {
    this.camera = camera;
    this.container = container;
    
    this.bindEvents();
    this.updateCamera();
  }
  
  private bindEvents() {
    // Mouse events
    this.container.addEventListener('mousedown', this.onMouseDown);
    this.container.addEventListener('mousemove', this.onMouseMove);
    this.container.addEventListener('mouseup', this.onMouseUp);
    this.container.addEventListener('mouseleave', this.onMouseUp);
    this.container.addEventListener('wheel', this.onWheel, { passive: false });
    
    // Prevent context menu on right-click
    this.container.addEventListener('contextmenu', (e) => e.preventDefault());
    
    // Nav widget interaction
    const navBall = document.getElementById('nav-ball');
    if (navBall) {
      navBall.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        this.isDragging = true;
        this.lastMouse = { x: e.clientX, y: e.clientY };
      });
    }
    
    // View buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = (e.target as HTMLElement).dataset.view;
        if (view) this.jumpToView(view as 'top' | 'front' | 'side' | 'perspective');
      });
    });
    
    // Nav control buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = (e.target as HTMLElement).dataset.action;
        if (action === 'zoom-in') this.dolly(-2);
        if (action === 'zoom-out') this.dolly(2);
        if (action === 'reset') this.reset();
      });
    });
  }
  
  private onMouseDown = (e: MouseEvent) => {
    if (e.button === 0) {
      // Left click: orbit
      this.isDragging = true;
    } else if (e.button === 2 || e.button === 1) {
      // Right click or middle click: pan
      this.isPanning = true;
    }
    this.lastMouse = { x: e.clientX, y: e.clientY };
  };
  
  private onMouseMove = (e: MouseEvent) => {
    const dx = e.clientX - this.lastMouse.x;
    const dy = e.clientY - this.lastMouse.y;
    
    if (this.isDragging) {
      this.orbit(dx, dy);
    } else if (this.isPanning) {
      this.pan(dx, dy);
    }
    
    this.lastMouse = { x: e.clientX, y: e.clientY };
  };
  
  private onMouseUp = () => {
    this.isDragging = false;
    this.isPanning = false;
  };
  
  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    this.dolly(e.deltaY * this.dollySpeed);
  };
  
  /**
   * Orbit around target
   */
  orbit(dx: number, dy: number) {
    this.state.theta -= dx * this.orbitSpeed;
    this.state.phi -= dy * this.orbitSpeed;
    
    // Clamp phi to prevent flipping
    this.state.phi = Math.max(this.minPhi, Math.min(this.maxPhi, this.state.phi));
    
    this.updateCamera();
  }
  
  /**
   * Pan the target point
   */
  pan(dx: number, dy: number) {
    const offset = new THREE.Vector3();
    
    // Get camera's right and up vectors
    const right = new THREE.Vector3();
    const up = new THREE.Vector3();
    
    this.camera.matrix.extractBasis(right, up, new THREE.Vector3());
    
    // Scale by radius for consistent feel
    const scale = this.state.radius * this.panSpeed * 0.01;
    
    offset.addScaledVector(right, -dx * scale);
    offset.addScaledVector(up, dy * scale);
    
    this.state.target.add(offset);
    this.updateCamera();
  }
  
  /**
   * Dolly in/out (change radius)
   */
  dolly(delta: number) {
    this.state.radius += delta;
    this.state.radius = Math.max(this.minRadius, Math.min(this.maxRadius, this.state.radius));
    this.updateCamera();
  }
  
  /**
   * Jump to preset view
   */
  jumpToView(view: 'top' | 'front' | 'side' | 'perspective') {
    // Deactivate all view buttons
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    
    // Activate current
    document.querySelector(`[data-view="${view}"]`)?.classList.add('active');
    
    switch (view) {
      case 'top':
        this.state.theta = 0;
        this.state.phi = 0.01;
        break;
      case 'front':
        this.state.theta = 0;
        this.state.phi = Math.PI / 2;
        break;
      case 'side':
        this.state.theta = Math.PI / 2;
        this.state.phi = Math.PI / 2;
        break;
      case 'perspective':
        this.state.theta = Math.PI / 4;
        this.state.phi = Math.PI / 4;
        break;
    }
    
    this.updateCamera();
  }
  
  /**
   * Reset to default view
   */
  reset() {
    this.state = {
      theta: Math.PI / 4,
      phi: Math.PI / 4,
      radius: 17,
      target: new THREE.Vector3(0, 0, 0),
    };
    
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    this.updateCamera();
  }
  
  /**
   * Update camera position from spherical state
   */
  private updateCamera() {
    const { theta, phi, radius, target } = this.state;
    
    // Spherical to Cartesian
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    
    this.camera.position.set(
      target.x + x,
      target.y + y,
      target.z + z
    );
    
    this.camera.lookAt(target);
  }
  
  /**
   * Get current camera position (for status display)
   */
  getPosition(): THREE.Vector3 {
    return this.camera.position.clone();
  }
  
  /**
   * Per-frame update (for smooth animations, input polling, etc.)
   */
  update(_delta: number) {
    // Future: smooth transitions, gamepad input, etc.
  }
  
  dispose() {
    this.container.removeEventListener('mousedown', this.onMouseDown);
    this.container.removeEventListener('mousemove', this.onMouseMove);
    this.container.removeEventListener('mouseup', this.onMouseUp);
    this.container.removeEventListener('wheel', this.onWheel);
  }
}
