import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class CameraManager {
  constructor(container, scene) {
    this.camera = new THREE.PerspectiveCamera(38, 1, 0.01, 1000);
    this.camera.position.set(8, 6, 10);
    this.controls = new OrbitControls(this.camera, container);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance = 0.2;
    this.controls.maxDistance = 500;
    this.controls.target.set(0, 1.2, 0);
    this.controls.update();
  }
  resize(width, height) {
    this.camera.aspect = Math.max(width, 1) / Math.max(height, 1);
    this.camera.updateProjectionMatrix();
  }
  update() { this.controls.update(); }
  reset() {
    this.camera.position.set(8, 6, 10);
    this.controls.target.set(0, 1.2, 0);
    this.controls.update();
  }
  setPreset(preset) {
    const positions = {
      perspective: [8, 6, 10],
      front: [0, 2, 12],
      back: [0, 2, -12],
      left: [-12, 2, 0],
      right: [12, 2, 0],
      top: [0, 12, 0],
    };
    this.camera.position.set(...(positions[preset] || positions.perspective));
    this.controls.target.set(0, 1.2, 0);
    this.controls.update();
  }
  fit(radius) {
    const distance = Math.max(radius * 2.2, 6);
    this.camera.position.set(distance * 0.72, distance * 0.48, distance * 0.82);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }
}
