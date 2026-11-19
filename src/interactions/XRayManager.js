export class XRayManager {
  constructor(modelRoot) {
    this.modelRoot = modelRoot;
    this.originalMaterials = new Map();
  }

  reset() {
    for (const [object, material] of this.originalMaterials) {
      for (const variant of [object.material].flat()) variant.dispose();
      object.material = material;
    }
    this.originalMaterials.clear();
  }

  setMode(mode, opacity = 35) {
    if (mode !== this.mode) this.reset();
    this.mode = mode;
    if (mode === 'solid') return;
    this.modelRoot.traverse(object => {
      if (!object.isMesh || object.userData.warningMarker) return;
      if (mode === 'xray' && object.userData.entity?.kind !== 'concrete') return;
      if (!this.originalMaterials.has(object)) {
        this.originalMaterials.set(object, object.material);
        object.material = Array.isArray(object.material)
          ? object.material.map(material => material.clone())
          : object.material.clone();
      }
      for (const material of [object.material].flat()) {
        if (mode === 'xray') {
          material.transparent = opacity < 100;
          material.opacity = opacity / 100;
          material.depthWrite = opacity === 100;
          material.wireframe = false;
        } else {
          material.wireframe = true;
        }
        material.needsUpdate = true;
      }
    });
  }
}
