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
    container.addEventListener('pointerdown', (event) => this.pick(event));
  }
  pick(event) {
    const rect = this.container.getBoundingRect ? this.container.getBoundingRect() : this.container.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.scene.children, true).filter((hit) => hit.object.isMesh);
    this.select(hits[0]?.object || null);
  }
  select(object) {
    if (this.selected?.isMesh) {
      const original = this.originalMaterials.get(this.selected);
      if (original) this.selected.material = original;
    }
    this.selected = object;
    if (!object) {
      this.state.set('selectedId', null);
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
    this.state.set('selectedId', object.userData.entity?.id || object.userData.partId || object.name || object.uuid);
  }
  clear() { this.select(null); }
}
