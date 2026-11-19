import * as THREE from 'three';

export class ClearanceChecker {
  constructor(minimumClearance = 25) {
    this.minimumClearance = minimumClearance * 0.001;
  }

  checkDistance(distance, requiredClearance = this.minimumClearance) {
    return distance >= requiredClearance;
  }

  checkSegmentPair(a, b, c, d, requiredClearance = this.minimumClearance) {
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
    const pa = a.clone().add(u.clone().multiplyScalar(sc));
    const pb = c.clone().add(v.clone().multiplyScalar(tc));
    const distance = pa.distanceTo(pb);
    return { valid: distance >= requiredClearance, distance };
  }

  check(entityPairs) {
    const errors = [];
    for (const pair of entityPairs || []) {
      if (pair.distance < this.minimumClearance) {
        errors.push(`Clearance violation between ${pair.aId || 'a'} and ${pair.bId || 'b'}: ${pair.distance}`);
      }
    }
    return { valid: errors.length === 0, errors };
  }
}

export default ClearanceChecker;
