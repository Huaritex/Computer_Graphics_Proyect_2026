import * as THREE from 'three';
import { DEFAULT_MATERIALS } from '../config/constants.js';
import { mmToScene, makeEntity } from './GeometryUtils.js';

export class ConcreteFactory {
  constructor(materialOptions = {}) {
    this.material = new THREE.MeshStandardMaterial({
      color: materialOptions.color ?? DEFAULT_MATERIALS.concrete,
      roughness: 0.75,
      transparent: materialOptions.transparent ?? false,
      opacity: materialOptions.opacity ?? 1,
    });
  }

  createBox({ width, depth, height, x = 0, y = 0, z = 0, id, elementId }) {
    const geometry = new THREE.BoxGeometry(
      mmToScene(width),
      mmToScene(height),
      mmToScene(depth),
    );
    const mesh = new THREE.Mesh(geometry, this.material);
    mesh.position.set(mmToScene(x), mmToScene(y), mmToScene(z));
    mesh.name = id || elementId || 'concrete';
    return makeEntity(mesh, {
      id: mesh.name,
      elementId: elementId || mesh.name,
      kind: 'concrete',
      position: mesh.position.clone(),
      length: mmToScene(height),
    });
  }

  createBeam(data = {}) {
    const geometry = new THREE.BoxGeometry(
      mmToScene(data.length),
      mmToScene(data.depth),
      mmToScene(data.width),
    );
    const mesh = new THREE.Mesh(geometry, this.material);
    mesh.name = `${data.id}-concrete`;
    return makeEntity(mesh, {
      id: mesh.name,
      elementId: data.id,
      kind: 'concrete',
      position: mesh.position.clone(),
      length: mmToScene(data.length),
    });
  }

  createColumn(data = {}) {
    return this.createBox({
      width: data.width,
      depth: data.depth,
      height: data.height,
      id: `${data.id}-concrete`,
      elementId: data.id,
    });
  }
}

export default ConcreteFactory;
