import * as THREE from 'three';
import { DEFAULT_MATERIALS, MM_TO_M } from '../config/constants.js';
import { makeEntity, mmToScene } from './GeometryUtils.js';

export class StirrupFactory {
  constructor(materialOptions = {}) {
    this.material = new THREE.MeshStandardMaterial({
      color: materialOptions.color ?? DEFAULT_MATERIALS.stirrup,
      roughness: 0.5,
      metalness: 0.1,
    });
  }

  createRectangularStirrup(options = {}) {
    const width = mmToScene(options.width);
    const depth = mmToScene(options.depth);
    const radius = mmToScene(options.diameter ?? 10) / 2;
    const axis = options.axis ?? 'x';
    const halfW = width / 2;
    const halfD = depth / 2;
    let points;
    if (axis === 'x') {
      points = [
        new THREE.Vector3(0, -halfD, -halfW),
        new THREE.Vector3(0, halfD, -halfW),
        new THREE.Vector3(0, halfD, halfW),
        new THREE.Vector3(0, -halfD, halfW),
      ];
    } else {
      points = [
        new THREE.Vector3(-halfW, 0, -halfD),
        new THREE.Vector3(halfW, 0, -halfD),
        new THREE.Vector3(halfW, 0, halfD),
        new THREE.Vector3(-halfW, 0, halfD),
      ];
    }
    points.push(points[0].clone());
    const curve = new THREE.CatmullRomCurve3(points, true, 'centripetal');
    const geometry = new THREE.TubeGeometry(curve, 64, radius, 8, true);
    const mesh = new THREE.Mesh(geometry, this.material);
    mesh.position.copy(options.position || new THREE.Vector3());
    mesh.name = options.id || `${options.elementId || 'element'}-stirrup`;
    return makeEntity(mesh, {
      id: mesh.name,
      elementId: options.elementId,
      kind: 'stirrup',
      diameter: options.diameter ?? 10,
      position: mesh.position.clone(),
      count: 1,
      length: 2 * ((options.width ?? 0) + (options.depth ?? 0)),
    });
  }

  createBeamStirrups(data = {}) {
    const group = new THREE.Group();
    const diameter = data.stirrup?.diameter ?? 10;
    const spacing = data.stirrup?.spacing ?? 150;
    const count = Math.max(1, Math.ceil(data.length / spacing));
    for (let i = 0; i < count; i++) {
      const x = mmToScene(-data.length / 2 + i * spacing);
      const stirrup = this.createRectangularStirrup({
        width: data.width - 2 * (data.cover ?? 40),
        depth: data.depth - 2 * (data.cover ?? 40),
        diameter,
        axis: 'x',
        position: new THREE.Vector3(x, 0, 0),
        id: `${data.id}-stirrup-${i + 1}`,
        elementId: data.id,
      });
      group.add(stirrup);
    }
    return group;
  }

  createColumnStirrups(data = {}) {
    const group = new THREE.Group();
    const diameter = data.stirrup?.diameter ?? 10;
    const spacing = data.stirrup?.spacing ?? 150;
    const count = Math.max(1, Math.ceil(data.height / spacing));
    for (let i = 0; i < count; i++) {
      const y = mmToScene(-data.height / 2 + i * spacing);
      const stirrup = this.createRectangularStirrup({
        width: data.width - 2 * (data.cover ?? 40),
        depth: data.depth - 2 * (data.cover ?? 40),
        diameter,
        axis: 'y',
        position: new THREE.Vector3(0, y, 0),
        id: `${data.id}-stirrup-${i + 1}`,
        elementId: data.id,
      });
      group.add(stirrup);
    }
    return group;
  }
}

export default StirrupFactory;
