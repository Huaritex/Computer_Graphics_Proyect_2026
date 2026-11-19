import * as THREE from 'three';

function pointSegmentDistanceSquared(point, a, b) {
  const ab = b.clone().sub(a);
  const t = THREE.MathUtils.clamp(point.clone().sub(a).dot(ab) / ab.dot(ab || new THREE.Vector3()), 0, 1);
  return point.distanceToSquared(a.clone().add(ab.multiplyScalar(t)));
}

export function segmentDistance(a, b, c, d) {
  if (a && a.start && b && b.start && c === undefined && d === undefined) {
    const pa = new THREE.Vector3(...a.start);
    const pb = new THREE.Vector3(...a.end);
    const pc = new THREE.Vector3(...b.start);
    const pd = new THREE.Vector3(...b.end);
    const result = segmentDistance(pa, pb, pc, pd);
    return result.distance;
  }
  const u = b.clone().sub(a);
  const v = d.clone().sub(c);
  const w = a.clone().sub(c);
  const aa = u.dot(u);
  const bb = u.dot(v);
  const cc = v.dot(v);
  const dd = u.dot(w);
  const ee = v.dot(w);
  const den = aa * cc - bb * bb;
  let sc = den > 1e-12 ? THREE.MathUtils.clamp((bb * ee - cc * dd) / den, 0, 1) : 0;
  let tc = cc > 1e-12 ? (bb * sc + ee) / cc : 0;
  if (tc < 0) {
    tc = 0;
    sc = aa > 1e-12 ? THREE.MathUtils.clamp(-dd / aa, 0, 1) : 0;
  } else if (tc > 1) {
    tc = 1;
    sc = aa > 1e-12 ? THREE.MathUtils.clamp((bb - dd) / aa, 0, 1) : 0;
  }
  const p = a.clone().add(u.multiplyScalar(sc));
  const q = c.clone().add(v.multiplyScalar(tc));
  const distance = p.distanceTo(q);
  return { distance, pointA: p, pointB: q };
}

export class CollisionDetector {
  constructor(options = {}) {
    this.minimumClearance = typeof options === 'number'
      ? options
      : (options.minimumClearance ?? 0);
  }

  static segmentDistance(a, b, c, d) {
    return segmentDistance(a, b, c, d);
  }

  segmentDistance(a, b, c, d) {
    return segmentDistance(a, b, c, d);
  }

  detect(segmentPairs, minimumClearance = this.minimumClearance) {
    const collisions = [];
    for (const pair of segmentPairs) {
      const [a, b, c, d] = pair.segments || pair;
      const result = segmentDistance(a, b, c, d);
      if (result.distance < minimumClearance) collisions.push({ ...pair, ...result });
    }
    return collisions;
  }

  detectObjectCollisions(objects, minimumClearance = this.minimumClearance) {
    const bars = objects.filter((object) => object.userData?.entity?.kind === 'rebar');
    const collisions = [];
    for (let i = 0; i < bars.length; i++) {
      for (let j = i + 1; j < bars.length; j++) {
        bars[i].updateWorldMatrix(true, true);
        bars[j].updateWorldMatrix(true, true);
        const segmentA = this.getBarSegment(bars[i]);
        const segmentB = this.getBarSegment(bars[j]);
        if (!segmentA || !segmentB) continue;
        const result = segmentDistance(segmentA.start, segmentA.end, segmentB.start, segmentB.end);
        const radiusA = bars[i].geometry.parameters?.radiusTop ?? bars[i].geometry.parameters?.radius ?? 0;
        const radiusB = bars[j].geometry.parameters?.radiusTop ?? bars[j].geometry.parameters?.radius ?? 0;
        const freeDistance = result.distance - radiusA - radiusB;
        if (freeDistance <= minimumClearance) {
          collisions.push({
            objects: [bars[i], bars[j]],
            distance: freeDistance,
            centerlineDistance: result.distance,
            pointA: result.pointA,
            pointB: result.pointB,
            type: freeDistance < 0 ? 'interference' : 'clearance',
          });
        }
      }
    }
    return collisions;
  }

  getBarSegment(bar) {
    if (!bar.geometry?.parameters?.height) return null;
    const halfLength = bar.geometry.parameters.height / 2;
    const localUp = new THREE.Vector3(0, 1, 0);
    const worldUp = localUp.applyQuaternion(bar.getWorldQuaternion(new THREE.Quaternion()));
    const center = bar.getWorldPosition(new THREE.Vector3());
    return {
      start: center.clone().addScaledVector(worldUp, -halfLength),
      end: center.clone().addScaledVector(worldUp, halfLength),
    };
  }
}

export { pointSegmentDistanceSquared };
export default CollisionDetector;
