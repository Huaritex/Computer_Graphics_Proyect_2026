import * as THREE from 'three';
import { gsap } from 'gsap';

export class SelectionManager {
  constructor(container, modelRoot, camera, state) {
    this.container = container;
    this.modelRoot = modelRoot;
    this.camera = camera;
    this.state = state;
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.selected = null;
    container.addEventListener('pointerdown', (event) => {
      if (event.button === 0 && event.target.tagName === 'CANVAS') {
        this.press = { id: event.pointerId, x: event.clientX, y: event.clientY };
      }
    });
    container.addEventListener('pointerup', (event) => {
      const press = this.press;
      this.press = null;
      if (press?.id === event.pointerId &&
          Math.hypot(event.clientX - press.x, event.clientY - press.y) < 5) this.pick(event);
    });
  }
  pick(event) {
    const rect = this.container.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const meshes = [];
    this.modelRoot.traverseVisible(object => {
      if (object.isMesh && !object.userData.warningMarker) meshes.push(object);
    });
    const [hit] = this.raycaster.intersectObjects(meshes, false);
    this.select(hit?.object || null);
  }
  select(object) {
    this.removeHighlight();
    this.selected = object;
    if (!object) {
      this.state.set({ selectedId: null, selectedObjectId: null });
      return;
    }
    this.highlight();
    const owner = this.resolveOwner(object);
    this.state.set({
      selectedId: owner.userData.element?.id || owner.userData.entity?.elementId || object.userData.entity?.id || object.userData.partId || object.name || object.uuid,
      selectedObjectId: object.uuid,
    });
  }
  highlight(animate = true) {
    const object = this.selected;
    if (!object?.isMesh) return;
    this.originalMaterial = object.material;
    const clone = material => {
      const highlight = material.clone();
      highlight.emissive?.set(0x4b93c9);
      if (animate && highlight.emissive) {
        gsap.fromTo(highlight, { emissiveIntensity: 0.2 }, { emissiveIntensity: 0.7, duration: 0.25, yoyo: true, repeat: 1 });
      }
      return highlight;
    };
    object.material = Array.isArray(object.material) ? object.material.map(clone) : clone(object.material);
  }
  removeHighlight() {
    if (!this.originalMaterial) return;
    const materials = [this.selected.material].flat();
    this.selected.material = this.originalMaterial;
    this.originalMaterial = null;
    materials.forEach(material => {
      gsap.killTweensOf(material);
      material.dispose();
    });
  }
  resolveOwner(object) {
    let current = object;
    while (current && current !== this.modelRoot) {
      if (current.userData?.element) return current;
      current = current.parent;
    }
    return object;
  }
  clear() { this.select(null); }
}
