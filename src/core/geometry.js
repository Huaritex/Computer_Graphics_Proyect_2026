export function mmToWorld(value, scale = 0.001) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError('El valor debe ser numérico');
  }
  return value * scale;
}

export function rectangularPerimeterPoints(width, height, z = 0) {
  if (width <= 0 || height <= 0) throw new RangeError('width y height deben ser positivos');
  const x = width / 2;
  const y = height / 2;
  return [
    [-x, -y, z], [x, -y, z], [x, y, z], [-x, y, z],
  ];
}

export function distributeLongitudinalBars(width, height, cover, diameter, count) {
  if (![width, height, cover, diameter].every(Number.isFinite) || count < 1) {
    throw new RangeError('Parámetros geométricos inválidos');
  }
  if (cover + diameter / 2 > width / 2 || cover + diameter / 2 > height / 2) {
    throw new RangeError('Las barras exceden la sección');
  }
  const x = width / 2 - cover - diameter / 2;
  const y = height / 2 - cover - diameter / 2;
  if (count === 4) return [[-x,-y],[x,-y],[x,y],[-x,y]];
  const points = [];
  const cols = Math.min(count, Math.max(2, Math.ceil(Math.sqrt(count))));
  const rows = Math.ceil(count / cols);
  for (let r = 0; r < rows && points.length < count; r++) {
    for (let c = 0; c < cols && points.length < count; c++) {
      const fx = cols === 1 ? 0 : c / (cols - 1);
      const fy = rows === 1 ? 0 : r / (rows - 1);
      points.push([-x + 2 * x * fx, -y + 2 * y * fy]);
    }
  }
  return points;
}
