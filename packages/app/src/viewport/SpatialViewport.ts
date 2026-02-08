/**
 * Spatial Viewport
 * 
 * THE interface. The 3D world you're always in.
 * Everything else overlays this.
 */

import * as THREE from 'three';
import type { WebShell } from '../shell/WebShell';

// Theme colors
const THEMES = {
  dark: {
    background: 0x1a1a1e,
    gridMajor: 0x444444,
    gridMinor: 0x2a2a2a,
    ground: 0x2a2a2e,
  },
  light: {
    background: 0xd0d0d8,
    gridMajor: 0xa0a0a8,
    gridMinor: 0xc0c0c8,
    ground: 0xc8c8cc,
  },
};

export class SpatialViewport {
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly renderer: THREE.WebGLRenderer;
  
  private shell: WebShell;
  private grid: THREE.GridHelper | null = null;
  private ground: THREE.Mesh | null = null;
  
  constructor(shell: WebShell) {
    this.shell = shell;
    
    const metrics = shell.getDisplayMetrics();
    const canvas = shell.getCanvas();
    
    // Get initial theme
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    const colors = THEMES[theme as keyof typeof THEMES];
    
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(colors.background);
    
    // Listen for theme changes
    window.addEventListener('theme-change', ((e: CustomEvent) => {
      this.applyTheme(e.detail.theme);
    }) as EventListener);
    
    // Camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      metrics.width / metrics.height,
      0.1,
      10000
    );
    this.camera.position.set(10, 10, 10);
    this.camera.lookAt(0, 0, 0);
    
    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
    });
    this.renderer.setPixelRatio(metrics.pixelRatio);
    this.renderer.setSize(metrics.width, metrics.height);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Handle resize
    shell.onResize((m) => {
      this.camera.aspect = m.width / m.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(m.width, m.height);
      this.renderer.setPixelRatio(m.pixelRatio);
    });
    
    // Setup basic lighting
    this.setupLighting();
    
    // Setup grid and axes
    this.setupHelpers();
  }
  
  private setupLighting() {
    // Ambient
    const ambient = new THREE.AmbientLight(0x404050, 0.5);
    this.scene.add(ambient);
    
    // Main directional (sun-like)
    const sun = new THREE.DirectionalLight(0xffffff, 1);
    sun.position.set(50, 100, 50);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 400;
    sun.shadow.camera.left = -100;
    sun.shadow.camera.right = 100;
    sun.shadow.camera.top = 100;
    sun.shadow.camera.bottom = -100;
    this.scene.add(sun);
    
    // Fill light
    const fill = new THREE.DirectionalLight(0x4060ff, 0.3);
    fill.position.set(-50, 50, -50);
    this.scene.add(fill);
  }
  
  private setupHelpers() {
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    const colors = THEMES[theme as keyof typeof THEMES];
    
    // Ground grid
    this.grid = new THREE.GridHelper(100, 100, colors.gridMajor, colors.gridMinor);
    this.grid.position.y = 0;
    this.scene.add(this.grid);
    
    // Axes helper (subtle)
    const axes = new THREE.AxesHelper(5);
    axes.position.set(0, 0.01, 0);
    this.scene.add(axes);
  }
  
  private applyTheme(theme: string) {
    const colors = THEMES[theme as keyof typeof THEMES] || THEMES.dark;
    
    // Update background
    this.scene.background = new THREE.Color(colors.background);
    
    // Update grid
    if (this.grid) {
      this.scene.remove(this.grid);
      this.grid.dispose();
      this.grid = new THREE.GridHelper(100, 100, colors.gridMajor, colors.gridMinor);
      this.grid.position.y = 0;
      this.scene.add(this.grid);
    }
    
    // Update ground
    if (this.ground) {
      (this.ground.material as THREE.MeshStandardMaterial).color.setHex(colors.ground);
    }
  }
  
  addTestScene() {
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    const colors = THEMES[theme as keyof typeof THEMES];
    
    // Ground plane
    const groundGeo = new THREE.PlaneGeometry(100, 100);
    const groundMat = new THREE.MeshStandardMaterial({ 
      color: colors.ground,
      roughness: 0.9,
      metalness: 0.1,
    });
    this.ground = new THREE.Mesh(groundGeo, groundMat);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);
    
    // Some test objects
    const boxGeo = new THREE.BoxGeometry(2, 2, 2);
    const boxMat = new THREE.MeshStandardMaterial({ 
      color: 0x4a9eff,
      roughness: 0.3,
      metalness: 0.7,
    });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.set(0, 1, 0);
    box.castShadow = true;
    box.receiveShadow = true;
    this.scene.add(box);
    
    // Sphere
    const sphereGeo = new THREE.SphereGeometry(1, 32, 32);
    const sphereMat = new THREE.MeshStandardMaterial({ 
      color: 0xff8c42,
      roughness: 0.4,
      metalness: 0.6,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.position.set(4, 1, 0);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    this.scene.add(sphere);
    
    // Cylinder
    const cylGeo = new THREE.CylinderGeometry(0.5, 0.5, 3, 32);
    const cylMat = new THREE.MeshStandardMaterial({ 
      color: 0x42ff8c,
      roughness: 0.5,
      metalness: 0.5,
    });
    const cyl = new THREE.Mesh(cylGeo, cylMat);
    cyl.position.set(-4, 1.5, 0);
    cyl.castShadow = true;
    cyl.receiveShadow = true;
    this.scene.add(cyl);
    
    // Update object count
    document.getElementById('objects')!.textContent = '4 objects';
  }
  
  render() {
    this.renderer.render(this.scene, this.camera);
  }
  
  dispose() {
    this.renderer.dispose();
  }
}
