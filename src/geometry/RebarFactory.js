import * as THREE from 'three';
import { DEFAULT_MATERIALS, MM_TO_M } from '../config/constants.js';
import { alignCylinderAlong, makeEntity, mmToScene } from './GeometryUtils.js';
import { columnBarLayout } from '../structural/columnBarLayout.js';

export class RebarFactory {
  constructor(materialOptions = {}) {
    this.material = new THREE.MeshStandardMaterial({
      color: materialOptions.color ?? DEFAULT_MATERIALS.rebar,
      roughness: 0.55,
      metalness: 0.15,
    });
  }

  createBar(start, end, options = {}) {
    const diameter = options.diameter ?? 16;
    const radius = mmToScene(diameter) / 2;
    const length = start.distanceTo(end);
    const geometry = new THREE.CylinderGeometry(radius, radius, length, 12, 1, false);
    const mesh = new THREE.Mesh(geometry, this.material);
    alignCylinderAlong(mesh, start, end);
    mesh.name = options.id || `${options.elementId || 'bar'}-rebar`;
    return makeEntity(mesh, {
      id: mesh.name,
      elementId: options.elementId || mesh.name,
      kind: 'rebar',
      diameter,
      position: mesh.position.clone(),
      count: 1,
      length: length / MM_TO_M,
    });
  }

  createBeamBars(data = {}) {
    const group = new THREE.Group();
    const elementId = data.id || 'beam';
    const diameter = data.rebar?.diameter ?? 16;
    const topCount = data.rebar?.topCount ?? 3;
    const bottomCount = data.rebar?.bottomCount ?? 3;
    const cover = data.cover ?? 40;
    const length = mmToScene(data.length - 2 * cover);
    const halfWidth = mmToScene(data.width) / 2;
    const halfDepth = mmToScene(data.depth) / 2;
    const inset = mmToScene(cover + (data.stirrup?.diameter ?? 10) + diameter / 2);

    for (const [layer, count, z] of [
      ['top', topCount, halfDepth - inset],
      ['bottom', bottomCount, -halfDepth + inset],
    ]) {
      for (let i = 0; i < count; i++) {
        const t = count === 1 ? 0.5 : i / (count - 1);
        const y = z;
        const x = (t - 0.5) * 2 * Math.max(0, halfWidth - inset);
        const start = new THREE.Vector3(-length / 2, y, x);
        const end = new THREE.Vector3(length / 2, y, x);
        group.add(this.createBar(start, end, {
          diameter,
          id: `${elementId}-${layer}-${i + 1}`,
          elementId,
        }));
      }
    }
    return group;
  }

  createColumnBars(data = {}) {
    const group = new THREE.Group();
    const elementId = data.id || 'column';
    const diameter = data.rebar?.diameter ?? data.rebar?.longitudinalDiameter ?? 16;
    const count = data.rebar?.longitudinalCount ?? 4;
    const cover = data.cover ?? 40;
    const halfHeight = mmToScene(data.height - 2 * cover) / 2;
    const inset = cover + (data.stirrup?.diameter ?? 10) + diameter / 2;
    const positions = columnBarLayout(data.width - 2 * inset, data.depth - 2 * inset, diameter, count);
    if (!positions) throw new Error('longitudinalCount no cabe en la sección de columna');
    for (const [i, [x, z]] of positions.entries()) {
      const start = new THREE.Vector3(mmToScene(x), -halfHeight, mmToScene(z));
      const end = new THREE.Vector3(mmToScene(x), halfHeight, mmToScene(z));
      group.add(this.createBar(start, end, {
        diameter,
        id: `${elementId}-longitudinal-${i + 1}`,
        elementId,
      }));
    }
    return group;
  }
}

export default RebarFactory;
