import * as THREE from 'three';

export class LightingManager {
  constructor(scene) {
    this.scene = scene;
    this.hemi = new THREE.HemisphereLight(0xf7fafc, 0x66717a, 2.2);
    this.key = new THREE.DirectionalLight(0xffffff, 3.4);
    this.key.position.set(7, 12, 8);
    this.key.castShadow = true;
    this.key.shadow.mapSize.set(2048, 2048);
    this.fill = new THREE.DirectionalLight(0x9ec5d8, 1.1);
    this.fill.position.set(-8, 5, -5);
    scene.add(this.hemi, this.key, this.fill);
  }
  setPreset(name) {
    const presets = {
      Estudio: [2.2, 3.4, 1.1],
      Exterior: [2.8, 4.2, 0.55],
      Tenue: [1.1, 1.8, 0.35],
    };
    const [hemi, key, fill] = presets[name] || presets.Estudio;
    this.hemi.intensity = hemi;
    this.key.intensity = key;
    this.fill.intensity = fill;
  }
}
