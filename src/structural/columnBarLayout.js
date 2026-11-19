export const barIntervals = (span, diameter) => Math.floor(span / diameter + 1e-10);

// Coordinates and diameters are in millimeters.
export function columnBarLayout(width, depth, diameter, count) {
  if (!Number.isInteger(count) || count < 4 || !Number.isFinite(diameter) || diameter <= 0) return null;
  const sides = [width, depth, width, depth];
  const segments = [1, 1, 1, 1];
  const capacities = sides.map(side => barIntervals(side, diameter));
  if (capacities.some(capacity => !Number.isFinite(capacity) || capacity < 1) ||
      count > capacities.reduce((total, capacity) => total + capacity, 0)) return null;

  for (let placed = 4; placed < count; placed++) {
    let best = -1;
    for (let side = 0; side < sides.length; side++) {
      if (segments[side] < capacities[side] &&
          (best === -1 || sides[side] / (segments[side] + 1) > sides[best] / (segments[best] + 1))) best = side;
    }
    segments[best]++;
  }

  const corners = [[-width / 2, -depth / 2], [width / 2, -depth / 2],
    [width / 2, depth / 2], [-width / 2, depth / 2]];
  const additional = sides.flatMap((_, side) => {
    const [x, z] = corners[side];
    const [nextX, nextZ] = corners[(side + 1) % sides.length];
    return Array.from({ length: segments[side] - 1 }, (_, index) => {
      const fraction = (index + 1) / segments[side];
      return [x + (nextX - x) * fraction, z + (nextZ - z) * fraction];
    });
  });
  return [...corners, ...additional];
}
