import * as THREE from 'three';

export class RendererManager {
  constructor(container) {
    this.container = container;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.domElement.className = 'three-canvas';
    container.appendChild(this.renderer.domElement);
  }
  resize() {
    const { width, height } = this.container.getBoundingClientRect();
    this.renderer.setSize(Math.max(width, 1), Math.max(height, 1), false);
  }
  render(scene, camera) { this.renderer.render(scene, camera); }
  dispose() { this.renderer.dispose(); }
}
