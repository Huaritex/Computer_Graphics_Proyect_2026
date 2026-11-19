export function validateGeometryConfig(config = {}) {
  const errors = [];
  const add = (value, name) => {
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
      errors.push(`${name} debe ser positivo`);
    }
  };
  add(config.length, 'length');
  add(config.width, 'width');
  add(config.height, 'height');
  add(config.cover, 'cover');
  if (config.cover > config.width / 2 || config.cover > config.height / 2) {
    errors.push('cover supera la mitad de la sección');
  }
  if (config.diameter !== undefined && (typeof config.diameter !== 'number' || config.diameter <= 0)) {
    errors.push('diameter debe ser positivo');
  }
  if (config.count !== undefined && (!Number.isInteger(config.count) || config.count < 1)) {
    errors.push('count debe ser entero y positivo');
  }
  return { valid: errors.length === 0, errors };
}

export default validateGeometryConfig;
