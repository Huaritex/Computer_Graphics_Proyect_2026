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
    const meshes = [];
    const box = new THREE.Box3();
    this.modelRoot.updateWorldMatrix(true, true);
    this.modelRoot.traverse((object) => {
      if (!object.isMesh || object.userData.warningMarker) return;
      if (!this.originalPositions.has(object)) this.originalPositions.set(object, object.position.clone());
      const origin = this.originalPositions.get(object);
      const matrix = new THREE.Matrix4().compose(origin, object.quaternion, object.scale);
      matrix.premultiply(object.parent.matrixWorld);
      if (!object.geometry.boundingBox) object.geometry.computeBoundingBox();
      box.union(object.geometry.boundingBox.clone().applyMatrix4(matrix));
      meshes.push(object);
    });
    const center = box.getCenter(new THREE.Vector3());
    const distance = amount * Math.max(box.getSize(new THREE.Vector3()).length() / 100, 0.08);
    meshes.forEach((object, index) => {
      const origin = this.originalPositions.get(object);
      const worldOrigin = object.parent.localToWorld(origin.clone());
      const direction = worldOrigin.clone().sub(center);
      if (direction.lengthSq() < 0.0001) direction.set(index < meshes.length / 2 ? -1 : 1, 0, 0);
      const target = active
        ? object.parent.worldToLocal(worldOrigin.add(direction.normalize().multiplyScalar(distance)))
        : origin;
      gsap.to(object.position, {
        x: target.x, y: target.y, z: target.z, duration: 0.65, ease: 'power2.inOut', overwrite: true,
        onComplete: () => object.position.copy(target),
      });
    });
  }
  setAmount(amount) { if (this.active) this.setExploded(true, amount); }
  reset() { this.setExploded(false, 0); }
  discard() {
    this.modelRoot.traverse(object => {
      if (this.originalPositions.has(object)) gsap.killTweensOf(object.position);
    });
    this.originalPositions = new WeakMap();
    this.active = false;
  }
}
