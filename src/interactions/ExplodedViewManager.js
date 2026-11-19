import { gsap } from 'gsap';
import * as THREE from 'three';

export class ExplodedViewManager {
  constructor(modelRoot) {
    this.modelRoot = modelRoot;
    this.active = false;
    this.originalPositions = new WeakMap();
  }
  setExploded(active, amount = 18) {
    this.active = active;
    const box = new THREE.Box3().setFromObject(this.modelRoot);
    const center = box.getCenter(new THREE.Vector3());
    const scale = Math.max(box.getSize(new THREE.Vector3()).length() / 100, 0.08);
    const distance = amount * scale;
    const meshes = [];
    this.modelRoot.traverse((object) => { if (object.isMesh) meshes.push(object); });
    meshes.forEach((object) => {
      if (!this.originalPositions.has(object)) this.originalPositions.set(object, object.position.clone());
      const origin = this.originalPositions.get(object);
      const fromCenter = origin.clone().sub(center);
      if (fromCenter.lengthSq() < 0.0001) fromCenter.set((meshes.indexOf(object) - meshes.length / 2), 0, 0);
      const target = active ? origin.clone().add(fromCenter.normalize().multiplyScalar(distance)) : origin.clone();
      gsap.to(object.position, { x: target.x, y: target.y, z: target.z, duration: 0.65, ease: 'power2.inOut' });
    });
  }
  setAmount(amount) { if (this.active) this.setExploded(true, amount); }
  reset() { this.setExploded(false, 0); }
}
