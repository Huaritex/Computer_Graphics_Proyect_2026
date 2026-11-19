import * as THREE from 'three';
import { SCALE } from '../config/constants.js';

export function mmToScene(value) {
  return value * SCALE;
}

export function makeEntity(object, entity) {
  // Dimensions in entity metadata are in millimeters; positions use scene units.
  object.userData.entity = {
    id: entity.id,
    elementId: entity.elementId,
    kind: entity.kind,
    diameter: entity.diameter,
    position: entity.position instanceof THREE.Vector3 ? entity.position.clone() : entity.position,
    count: entity.count ?? 1,
    length: entity.length,
  };
  return object;
}

export function segmentDistance(a, b, c, d) {
  const u = b.clone().sub(a);
  const v = d.clone().sub(c);
  const w = a.clone().sub(c);
  const aa = u.dot(u), bb = u.dot(v), cc = v.dot(v), dd = u.dot(w), ee = v.dot(w);
  const den = aa * cc - bb * bb;
  let sc = 0, tc = 0;
  if (den < 1e-12) tc = cc > 0 ? ee / cc : 0;
  else { sc = THREE.MathUtils.clamp((bb * ee - cc * dd) / den, 0, 1); tc = THREE.MathUtils.clamp((aa * ee - bb * dd) / den, 0, 1); }
  sc = THREE.MathUtils.clamp(sc, 0, 1);
  tc = THREE.MathUtils.clamp(tc, 0, 1);
  const pa = a.clone().add(u.multiplyScalar(sc));
  const pb = c.clone().add(v.multiplyScalar(tc));
  return pa.distanceTo(pb);
}

export function alignCylinderAlong(object, start, end) {
  const direction = end.clone().sub(start);
  const midpoint = start.clone().add(end).multiplyScalar(0.5);
  object.position.copy(midpoint);
  object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
  return object;
}

export default { mmToScene, makeEntity, segmentDistance, alignCylinderAlong };
