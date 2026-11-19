import { gsap } from 'gsap';

export class CameraInteraction {
  constructor(cameraManager) { this.cameraManager = cameraManager; }
  animatePreset(preset) {
    const positions = {
      perspective: [8, 6, 10], front: [0, 2, 12], back: [0, 2, -12],
      left: [-12, 2, 0], right: [12, 2, 0], top: [0, 12, 0],
    };
    const position = positions[preset] || positions.perspective;
    gsap.to(this.cameraManager.camera.position, {
      x: position[0], y: position[1], z: position[2], duration: 0.55,
      ease: 'power2.inOut', overwrite: true, onUpdate: () => this.cameraManager.controls.update(),
    });
  }
  focusPoint(point) {
    gsap.to(this.cameraManager.controls.target, {
      x: point.x, y: point.y, z: point.z, duration: 0.45,
      ease: 'power2.inOut', onUpdate: () => this.cameraManager.controls.update(),
    });
  }
}
