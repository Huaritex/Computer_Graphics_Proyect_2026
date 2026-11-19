import * as THREE from 'three';
import BeamGenerator from '../geometry/BeamGenerator.js';
import ColumnGenerator from '../geometry/ColumnGenerator.js';
import JointGenerator from '../geometry/JointGenerator.js';

export class SceneManager {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xdde3e8);
    this.modelRoot = new THREE.Group();
    this.modelRoot.name = 'Modelo';
    this.scene.add(this.modelRoot);
    this.grid = new THREE.GridHelper(100, 20, 0x9aa4ad, 0xc5ccd2);
    this.grid.position.y = -0.02;
    this.scene.add(this.grid);
    const axes = new THREE.AxesHelper(3);
    axes.name = 'Ejes';
    axes.position.y = 0.01;
    this.scene.add(axes);
  }
  clearModel() {
    this.modelRoot.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      }
    });
    this.modelRoot.clear();
  }
  fitObject(object, controls) {
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const radius = Math.max(size.length() * 0.5, 0.1);
    object.position.sub(center);
    if (controls) {
      controls.target.set(0, 0, 0);
      controls.update();
    }
    return { size, radius };
  }
  createExample() {
    return this.createStructural('joint');
  }
  createStructural(type = 'joint', parameters = {}) {
    const assembly = this.buildStructural(type, parameters);
    this.clearModel();
    this.modelRoot.add(assembly);
    return assembly;
  }
  buildStructural(type, parameters) {
    let assembly;
    if (type === 'beam') assembly = new BeamGenerator().generate(parameters);
    else if (type === 'column') assembly = new ColumnGenerator().generate(parameters);
    else assembly = new JointGenerator().generate(parameters);
    assembly.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
    return assembly;
  }
}
