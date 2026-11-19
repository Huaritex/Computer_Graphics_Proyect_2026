import * as THREE from 'three';

export class XRayManager {
  constructor(modelRoot) { this.modelRoot = modelRoot; }
  setMode(mode, opacity = 35) {
    this.modelRoot.traverse((object) => {
      if (!object.isMesh) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => {
        if (!material.userData.originalXRay) {
          material.userData.originalXRay = {
            transparent: material.transparent,
            opacity: material.opacity,
            depthWrite: material.depthWrite,
            wireframe: material.wireframe,
          };
        }
        const original = material.userData.originalXRay;
        if (mode === 'xray') {
          material.transparent = true;
          material.opacity = opacity / 100;
          material.depthWrite = false;
          material.wireframe = false;
        } else if (mode === 'wireframe') {
          material.transparent = original.transparent;
          material.opacity = original.opacity;
          material.depthWrite = original.depthWrite;
          material.wireframe = true;
        } else {
          material.transparent = original.transparent;
          material.opacity = original.opacity;
          material.depthWrite = original.depthWrite;
          material.wireframe = false;
        }
        material.needsUpdate = true;
      });
    });
  }
}
