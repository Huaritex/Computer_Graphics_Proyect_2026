import * as THREE from 'three';
import { gsap } from 'gsap';

export class SelectionManager {
  constructor(container, scene, camera, state) {
    this.container = container;
    this.scene = scene;
    this.camera = camera;
    this.state = state;
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.selected = null;
    this.originalMaterials = new WeakMap();
    container.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || event.target.closest?.('.object-inspector')) return;
      this.pick(event);
    });
  }
  pick(event) {
    const rect = this.container.getBoundingRect ? this.container.getBoundingRect() : this.container.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.scene.children, true).filter((hit) => hit.object.isMesh);
    const hit = hits.find(({ object }) => object.userData?.entity || object.userData?.element) || hits[0];
    this.select(hit?.object || null);
  }
  select(object) {
    if (this.selected?.isMesh) {
      const original = this.originalMaterials.get(this.selected);
      if (original) this.selected.material = original;
    }
    this.selected = object;
    if (!object) {
      this.state.set({ selectedId: null, selectedObjectId: null });
      return;
    }
    this.originalMaterials.set(object, object.material);
    const highlight = Array.isArray(object.material)
      ? object.material.map((material) => material.clone())
      : object.material.clone();
    if (Array.isArray(highlight)) highlight.forEach((m) => { m.emissive?.set(0x4b93c9); });
    else highlight.emissive?.set(0x4b93c9);
    object.material = highlight;
    gsap.fromTo(highlight, { emissiveIntensity: 0.2 }, { emissiveIntensity: 0.7, duration: 0.25, yoyo: true, repeat: 1 });
    const owner = this.resolveOwner(object);
    this.state.set({
      selectedId: owner.userData.element?.id || owner.userData.entity?.elementId || object.userData.entity?.id || object.userData.partId || object.name || object.uuid,
      selectedObjectId: object.uuid,
    });
  }
  resolveOwner(object) {
    let current = object;
    while (current && current !== this.scene) {
      if (current.userData?.element) return current;
      current = current.parent;
    }
    return object;
  }
  clear() { this.select(null); }
}
