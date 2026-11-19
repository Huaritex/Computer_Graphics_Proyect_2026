function distancePointSegment(point, start, end) {
  const ab = [end[0]-start[0], end[1]-start[1], end[2]-start[2]];
  const ap = [point[0]-start[0], point[1]-start[1], point[2]-start[2]];
  const ab2 = ab[0]*ab[0]+ab[1]*ab[1]+ab[2]*ab[2];
  if (ab2 === 0) return Math.hypot(...ap);
  let t = (ap[0]*ab[0]+ap[1]*ab[1]+ap[2]*ab[2])/ab2;
  t = Math.max(0, Math.min(1, t));
  const closest = [start[0]+ab[0]*t, start[1]+ab[1]*t, start[2]+ab[2]*t];
  return Math.hypot(point[0]-closest[0], point[1]-closest[1], point[2]-closest[2]);
}

export function segmentDistance(a, b) {
  const p = a.start;
  const q = b.start;
  const d1 = [a.end[0]-p[0], a.end[1]-p[1], a.end[2]-p[2]];
  const d2 = [b.end[0]-q[0], b.end[1]-q[1], b.end[2]-q[2]];
  const cross = [
    d1[1]*d2[2]-d1[2]*d2[1],
    d1[2]*d2[0]-d1[0]*d2[2],
    d1[0]*d2[1]-d1[1]*d2[0],
  ];
  const cross2 = cross[0]*cross[0]+cross[1]*cross[1]+cross[2]*cross[2];
  if (cross2 > 0) {
    const r = [q[0]-p[0], q[1]-p[1], q[2]-p[2]];
    const rxd2 = [
      r[1]*d2[2]-r[2]*d2[1],
      r[2]*d2[0]-r[0]*d2[2],
      r[0]*d2[1]-r[1]*d2[0],
    ];
    const rxd1 = [
      r[1]*d1[2]-r[2]*d1[1],
      r[2]*d1[0]-r[0]*d1[2],
      r[0]*d1[1]-r[1]*d1[0],
    ];
    const s = (rxd2[0]*cross[0]+rxd2[1]*cross[1]+rxd2[2]*cross[2])/cross2;
    const t = (rxd1[0]*cross[0]+rxd1[1]*cross[1]+rxd1[2]*cross[2])/cross2;
    if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
      return 0;
    }
  }
  const r = [q[0]-p[0], q[1]-p[1], q[2]-p[2]];
  const dot = (x, y) => x[0]*y[0]+x[1]*y[1]+x[2]*y[2];
  const A = dot(d1,d1);
  const B = dot(d1,d2);
  const C = dot(d2,d2);
  const D = dot(d1,r);
  const E = dot(d2,r);
  const den = A*C-B*B;
  let s = 0;
  let t = 0;
  if (A === 0) return distancePointSegment(q, p, a.end);
  if (C === 0) return distancePointSegment(p, q, b.end);
  const candidates = [];
  const addCandidate = (s0, t0) => candidates.push([s0, t0]);
  if (den !== 0) {
    s = Math.max(0, Math.min(1, (B*E-C*D)/den));
    t = Math.max(0, Math.min(1, (B*s-D)/C));
    s = Math.max(0, Math.min(1, (B*t-D)/A));
  }
  addCandidate(s, t);
  addCandidate(0, Math.max(0, Math.min(1, -E/C)));
  addCandidate(1, Math.max(0, Math.min(1, (B-E)/C)));
  addCandidate(Math.max(0, Math.min(1, -D/A)), 0);
  addCandidate(Math.max(0, Math.min(1, (B-D)/A)), 1);
  let best = Infinity;
  for (const [s0, t0] of candidates) {
    const pa = [p[0]+d1[0]*s0, p[1]+d1[1]*s0, p[2]+d1[2]*s0];
    const pb = [q[0]+d2[0]*t0, q[1]+d2[1]*t0, q[2]+d2[2]*t0];
    best = Math.min(best, Math.hypot(pa[0]-pb[0], pa[1]-pb[1], pa[2]-pb[2]));
  }
  return best;
}

export class CollisionDetector {
  constructor(minClearance = 0) { this.minClearance = minClearance; }
  detect(segments = []) {
    const collisions = [];
    for (let i = 0; i < segments.length; i++) {
      for (let j = i + 1; j < segments.length; j++) {
        const distance = segmentDistance(segments[i], segments[j]);
        if (distance < this.minClearance) {
          collisions.push({ a: i, b: j, distance });
        }
      }
    }
    return collisions;
  }
}

export default CollisionDetector;
